import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ScrollText,
  Heart,
  Search,
  X,
  Copy,
  Check,
  BookOpenCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Library,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ListFilter,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReadingModeToolbar } from "@/components/ReadingModeToolbar";
import {
  FONT_SIZE_CLASSES,
  NIGHT_MODE_STYLES,
  useReadingSettings,
} from "@/hooks/useReadingSettings";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_HADITHS,
  HADITH_BOOKS,
  getHadithBookBySlugOrCategory,
  translateHadithGrade,
  translateHadithSectionTitle,
  type HadithBookCollection,
  type HadithBookEntry,
  type HadithBookSection,
  type HadithItem,
} from "@/data/hadithData";
import { HADITH_CATEGORY_SLUGS, getHadithCategorySlug } from "@/lib/site";
import {
  filterHadiths,
  getDailyHadith,
  normalizeQuestionText,
  toArabicNumerals,
} from "@/lib/quranAndQuizUtils";
import { cn } from "@/lib/utils";

interface RawEditionApiResponse {
  metadata?: {
    name?: string;
    sections?: Record<string, string>;
    section_detail?: Record<
      string,
      {
        hadithnumber_first?: number;
        hadithnumber_last?: number;
        arabicnumber_first?: number;
        arabicnumber_last?: number;
      }
    >;
  };
  hadiths?: Array<{
    hadithnumber: number;
    arabicnumber?: number;
    text: string;
    grades?: Array<{ name?: string; grade?: string }>;
    reference?: { book?: number; hadith?: number };
  }>;
}

const HADITHS_PER_PAGE = 30;

function parseCompleteBookResponse(
  book: HadithBookCollection,
  raw: RawEditionApiResponse | null | undefined
): { sections: HadithBookSection[]; hadiths: HadithBookEntry[] } {
  if (!raw || !Array.isArray(raw.hadiths) || raw.hadiths.length === 0) {
    return {
      sections: book.fallbackSections,
      hadiths: book.fallbackHadiths,
    };
  }

  const rawSections = raw.metadata?.sections ?? {};
  const rawDetails = raw.metadata?.section_detail ?? {};
  const sectionTitleMap = new Map<number, string>();
  const parsedSections: HadithBookSection[] = [];

  for (const [key, rawName] of Object.entries(rawSections)) {
    const secNum = Number(key);
    if (!Number.isFinite(secNum) || secNum <= 0) continue;
    if (!rawName && Object.keys(rawSections).length > 1) continue;

    const detail = rawDetails[key];
    const first = detail?.hadithnumber_first ?? 0;
    const last = detail?.hadithnumber_last ?? 0;
    const arabicTitle = translateHadithSectionTitle(rawName, secNum);
    sectionTitleMap.set(secNum, arabicTitle);

    parsedSections.push({
      id: key,
      number: secNum,
      title: arabicTitle,
      englishTitle: rawName,
      hadithFirst: first,
      hadithLast: last,
      count: last >= first && first > 0 ? last - first + 1 : 0,
    });
  }

  if (parsedSections.length === 0) {
    for (const fb of book.fallbackSections) {
      sectionTitleMap.set(fb.number, fb.title);
      parsedSections.push(fb);
    }
  }

  const parsedHadiths: HadithBookEntry[] = [];
  for (const item of raw.hadiths) {
    const cleanText = item.text?.trim();
    if (!cleanText) continue;

    let secNum = item.reference?.book ?? 0;
    if (!secNum || !sectionTitleMap.has(secNum)) {
      const exactMatch = parsedSections.find(
        (s) =>
          s.hadithFirst > 0 &&
          item.hadithnumber >= s.hadithFirst &&
          item.hadithnumber <= s.hadithLast
      );
      if (exactMatch) {
        secNum = exactMatch.number;
      } else {
        const preceding = [...parsedSections]
          .reverse()
          .find((s) => s.hadithFirst > 0 && item.hadithnumber >= s.hadithFirst);
        secNum = preceding?.number ?? parsedSections[0]?.number ?? 1;
      }
    }

    const secTitle =
      sectionTitleMap.get(secNum) ??
      book.fallbackSections.find((s) => s.number === secNum)?.title ??
      book.title;

    const rawGrade = item.grades?.[0]?.grade;
    const grade = rawGrade ? translateHadithGrade(rawGrade) : book.gradeSummary.split(" ")[0] || "صحيح";

    parsedHadiths.push({
      hadithnumber: item.hadithnumber,
      arabicnumber: item.arabicnumber,
      text: cleanText,
      sectionNumber: secNum,
      sectionTitle: secTitle,
      grade,
      referenceHadith: item.reference?.hadith,
    });
  }

  // Recompute exact counts per section
  const countsBySec = new Map<number, number>();
  for (const h of parsedHadiths) {
    countsBySec.set(h.sectionNumber, (countsBySec.get(h.sectionNumber) ?? 0) + 1);
  }
  const enrichedSections = parsedSections.map((s) => ({
    ...s,
    count: countsBySec.get(s.number) ?? s.count,
  }));

  return {
    sections: enrichedSections,
    hadiths: parsedHadiths.length > 0 ? parsedHadiths : book.fallbackHadiths,
  };
}

const Hadith = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();

  const matchedSlugMeta = categorySlug ? HADITH_CATEGORY_SLUGS[categorySlug] : undefined;
  const selectedBook = useMemo(
    () => getHadithBookBySlugOrCategory(categorySlug ?? matchedSlugMeta?.category),
    [categorySlug, matchedSlugMeta]
  );

  const [filter, setFilter] = useState<string>(
    !selectedBook && matchedSlugMeta ? matchedSlugMeta.category : "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [activeSectionNumber, setActiveSectionNumber] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [collapsedExplanations, setCollapsedExplanations] = useState<Record<string, boolean>>({});

  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const {
    settings,
    activeTheme,
    toggleReadingMode,
    toggleNightMode,
    setFontSize,
    stepFontSize,
    setBgTheme,
    resetSettings,
  } = useReadingSettings();

  useEffect(() => {
    if (selectedBook) {
      setActiveSectionNumber("all");
      setBookSearchQuery("");
      setChapterSearchQuery("");
      setCurrentPage(1);
      setShowAllChapters(false);
    } else if (matchedSlugMeta) {
      setFilter(matchedSlugMeta.category);
    } else if (!categorySlug) {
      setFilter("all");
    }
  }, [categorySlug, matchedSlugMeta, selectedBook]);

  // Fetch complete book JSON from CDN when a book is selected
  const { data: completeBookData, isFetching: isFetchingBook } = useQuery({
    queryKey: ["hadith-complete-book", selectedBook?.edition],
    enabled: Boolean(selectedBook),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
    queryFn: async () => {
      if (!selectedBook) return null;
      const res = await fetch(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${selectedBook.edition}.min.json`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch ${selectedBook.edition}`);
      }
      return (await res.json()) as RawEditionApiResponse;
    },
  });

  const activeBookContent = useMemo(() => {
    if (!selectedBook) return null;
    return parseCompleteBookResponse(selectedBook, completeBookData);
  }, [selectedBook, completeBookData]);

  const filteredBookSections = useMemo(() => {
    if (!activeBookContent) return [];
    const q = normalizeQuestionText(chapterSearchQuery);
    if (!q) return activeBookContent.sections;
    return activeBookContent.sections.filter(
      (sec) =>
        normalizeQuestionText(sec.title).includes(q) ||
        String(sec.number).includes(q) ||
        (sec.englishTitle && sec.englishTitle.toLowerCase().includes(q.toLowerCase()))
    );
  }, [activeBookContent, chapterSearchQuery]);

  const filteredBookHadiths = useMemo(() => {
    if (!activeBookContent) return [];
    const bySection =
      activeSectionNumber === "all"
        ? activeBookContent.hadiths
        : activeBookContent.hadiths.filter((h) => h.sectionNumber === activeSectionNumber);

    const q = normalizeQuestionText(bookSearchQuery);
    if (!q) return bySection;

    return bySection.filter(
      (h) =>
        String(h.hadithnumber) === q.trim() ||
        normalizeQuestionText(h.text).includes(q) ||
        normalizeQuestionText(h.sectionTitle).includes(q)
    );
  }, [activeBookContent, activeSectionNumber, bookSearchQuery]);

  const totalBookPages = Math.max(1, Math.ceil(filteredBookHadiths.length / HADITHS_PER_PAGE));

  const paginatedBookHadiths = useMemo(() => {
    const safePage = Math.min(currentPage, totalBookPages);
    const start = (safePage - 1) * HADITHS_PER_PAGE;
    return filteredBookHadiths.slice(start, start + HADITHS_PER_PAGE);
  }, [filteredBookHadiths, currentPage, totalBookPages]);

  const handleSelectBook = (book: HadithBookCollection) => {
    navigate(`/hadith/${book.slug}`);
  };

  const handleSelectCategory = (cat: string) => {
    setFilter(cat);
    if (cat === "all") {
      navigate("/hadith");
      return;
    }
    const slug = getHadithCategorySlug(cat);
    if (slug) {
      navigate(`/hadith/${slug}`);
    }
  };

  const handleToggleFavorite = (h: HadithItem) => {
    const added = toggleFavorite({
      sourceId: h.id,
      type: "hadith",
      title: `${h.title} — عن ${h.narrator}`,
      text: h.text,
      category: h.category,
      virtue: h.explanation,
      source: `${h.source} (${h.grade})`,
    });
    toast({
      title: added ? "تمت الإضافة إلى مفضلتك" : "تمت الإزالة من المفضلة",
      description: added ? "يمكنك الرجوع للحديث في صفحة مفضلتك" : undefined,
    });
  };

  const handleToggleBookHadithFavorite = (
    book: HadithBookCollection,
    entry: HadithBookEntry
  ) => {
    const favId = `${book.edition}-${entry.hadithnumber}`;
    const added = toggleFavorite({
      sourceId: favId,
      type: "hadith",
      title: `${book.title} — حديث رقم ${toArabicNumerals(entry.hadithnumber)} (${entry.sectionTitle})`,
      text: entry.text,
      category: book.title,
      virtue: `${entry.sectionTitle} • ${book.fullTitle}`,
      source: `${book.title} (${entry.grade})`,
    });
    toast({
      title: added ? "تمت الإضافة إلى مفضلتك" : "تمت الإزالة من المفضلة",
      description: added ? "يمكنك الرجوع للحديث في صفحة مفضلتك" : undefined,
    });
  };

  const handleCopyHadith = async (h: HadithItem) => {
    try {
      const formatted = `${h.title}\nعن ${h.narrator} أن رسول الله ﷺ قال:\n${h.text}\n— ${h.source}`;
      await navigator.clipboard?.writeText(formatted);
      setCopiedId(h.id);
      toast({ title: "تم نسخ الحديث الشريف", description: h.title });
      setTimeout(() => setCopiedId((prev) => (prev === h.id ? null : prev)), 2000);
    } catch {
      toast({ title: "تعذّر نسخ النص", variant: "destructive" });
    }
  };

  const handleCopyBookHadith = async (book: HadithBookCollection, entry: HadithBookEntry) => {
    const copyKey = `${book.edition}-${entry.hadithnumber}`;
    try {
      const formatted = `${book.title} — ${entry.sectionTitle} (حديث رقم ${entry.hadithnumber})\n${entry.text}\n— المصدر: ${book.title} (${entry.grade})`;
      await navigator.clipboard?.writeText(formatted);
      setCopiedId(copyKey);
      toast({
        title: "تم نسخ الحديث الشريف",
        description: `${book.title} • حديث رقم ${toArabicNumerals(entry.hadithnumber)}`,
      });
      setTimeout(() => setCopiedId((prev) => (prev === copyKey ? null : prev)), 2000);
    } catch {
      toast({ title: "تعذّر نسخ النص", variant: "destructive" });
    }
  };

  const toggleExplanation = (id: string) => {
    setCollapsedExplanations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = useMemo(
    () => Array.from(new Set(DEFAULT_HADITHS.map((h) => h.category))),
    []
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: DEFAULT_HADITHS.length };
    for (const h of DEFAULT_HADITHS) {
      counts[h.category] = (counts[h.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const filtered = useMemo(
    () => filterHadiths(DEFAULT_HADITHS, filter, searchQuery),
    [filter, searchQuery]
  );

  const dailyHadith = useMemo(() => getDailyHadith(DEFAULT_HADITHS), []);

  const activeCategoryMeta = matchedSlugMeta ?? (
    filter !== "all"
      ? Object.values(HADITH_CATEGORY_SLUGS).find((item) => item.category === filter)
      : undefined
  );

  const { nightMode, fontSize } = settings;
  const fontClass = FONT_SIZE_CLASSES[fontSize].azkar;

  const displayedSections = useMemo(() => {
    if (!filteredBookSections.length) return [];
    if (showAllChapters || chapterSearchQuery.trim() || filteredBookSections.length <= 16) {
      return filteredBookSections;
    }
    return filteredBookSections.slice(0, 16);
  }, [filteredBookSections, showAllChapters, chapterSearchQuery]);

  return (
    <Layout>
      <SEO
        title={activeCategoryMeta?.title}
        description={activeCategoryMeta?.description}
        noindex={Boolean(categorySlug && !activeCategoryMeta && !selectedBook)}
        canonicalPath={
          activeCategoryMeta
            ? `/hadith/${activeCategoryMeta.slug}`
            : selectedBook
              ? `/hadith/${selectedBook.slug}`
              : categorySlug
                ? `/hadith/${categorySlug}`
                : "/hadith"
        }
        breadcrumbs={
          activeCategoryMeta
            ? [
                { name: "الأحاديث النبوية", path: "/hadith" },
                { name: activeCategoryMeta.category, path: `/hadith/${activeCategoryMeta.slug}` },
              ]
            : [{ name: "الأحاديث النبوية", path: "/hadith" }]
        }
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-800 to-amber-900 text-primary-foreground py-16">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <PageBreadcrumb
            items={
              selectedBook
                ? [
                    { label: "مكتبة كتب الحديث الشريف", to: "/hadith" },
                    { label: selectedBook.title },
                  ]
                : activeCategoryMeta
                  ? [
                      { label: "الأحاديث النبوية", to: "/hadith" },
                      { label: activeCategoryMeta.category },
                    ]
                  : [{ label: "مكتبة كتب الحديث الشريف الكاملة" }]
            }
          />
          <ScrollText className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 text-primary-foreground">
            {selectedBook
              ? `${selectedBook.title} كاملاً`
              : activeCategoryMeta
                ? `الأحاديث النبوية — ${activeCategoryMeta.category}`
                : "موسوعة مجموعات كتب الحديث الشريف الكاملة"}
          </h1>
          <p className="text-primary-foreground/85 max-w-2xl mx-auto">
            {selectedBook
              ? `${selectedBook.fullTitle} — ${selectedBook.author} (${selectedBook.deathHijri})`
              : activeCategoryMeta?.description ??
                "الكتب التسعة ودواوين السنة النبوية المشرفة كاملة بجميع كتبها وأبوابها وأحاديثها المضبوطة بالتشكيل: الصحيحان والسنن الأربعة وموطأ مالك والأربعون النووية والأحاديث القدسية"}
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div
          className={cn(
            "max-w-5xl mx-auto rounded-3xl transition-colors duration-300",
            nightMode
              ? cn(NIGHT_MODE_STYLES.sectionStyle, "p-4 sm:p-6")
              : activeTheme.id !== "default"
                ? cn(activeTheme.sectionStyle, "p-4 sm:p-6")
                : ""
          )}
        >
          <ReadingModeToolbar
            settings={settings}
            onToggleReadingMode={toggleReadingMode}
            onToggleNightMode={toggleNightMode}
            onSetFontSize={setFontSize}
            onStepFontSize={stepFontSize}
            onSetBgTheme={setBgTheme}
            onReset={resetSettings}
          />

          {/* ===================================================================== */}
          {/* VIEW 1: COMPLETE BOOK READER WHEN A BOOK IS SELECTED                   */}
          {/* ===================================================================== */}
          {selectedBook && activeBookContent ? (
            <div data-testid="hadith-book-reader" className="space-y-6">
              {/* Top Navigation & Book Switcher */}
              <div
                className={cn(
                  "rounded-2xl border p-5 sm:p-6",
                  nightMode
                    ? "bg-[#14251F] border-[#2C473D] text-[#EAE3D2]"
                    : "bg-gradient-card border-border shadow-soft"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/hadith")}
                    className={cn(
                      "gap-1.5 rounded-xl",
                      nightMode && "bg-[#15241F] border-[#263B33] text-[#EAE3D2] hover:bg-[#24362F]"
                    )}
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>العودة إلى مجموعات كتب الحديث</span>
                  </Button>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      إجمالي الأبواب:{" "}
                      <strong className="text-foreground">
                        {toArabicNumerals(
                          Math.max(selectedBook.totalSections, activeBookContent.sections.length)
                        )}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      إجمالي أحاديث الكتاب:{" "}
                      <strong className="text-foreground">
                        {toArabicNumerals(
                          Math.max(selectedBook.totalHadiths, activeBookContent.hadiths.length)
                        )}
                      </strong>
                    </span>
                    {isFetchingBook && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-primary font-medium">
                          جاري تحميل جميع أحاديث المصنّف كاملة...
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <h2
                  className={cn(
                    "font-display text-2xl sm:text-3xl font-bold mb-1",
                    nightMode ? "text-[#E5C158]" : "text-primary"
                  )}
                >
                  {selectedBook.title}
                </h2>
                <p
                  className={cn(
                    "text-xs sm:text-sm mb-3",
                    nightMode ? "text-[#A7B8B0]" : "text-muted-foreground"
                  )}
                >
                  {selectedBook.author} ({selectedBook.deathHijri}) · {selectedBook.gradeSummary}
                </p>
                <p
                  className={cn(
                    "text-sm leading-relaxed mb-4",
                    nightMode ? "text-[#EAE3D2]/90" : "text-foreground/90"
                  )}
                >
                  {selectedBook.description}
                </p>

                {/* Quick switcher between the 9 books */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/60">
                  {HADITH_BOOKS.map((b) => {
                    const isCurrent = b.slug === selectedBook.slug;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBook(b)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-medium transition-smooth whitespace-nowrap",
                          isCurrent
                            ? "bg-primary text-primary-foreground shadow-soft"
                            : nightMode
                              ? "bg-[#15241F] text-[#EAE3D2] border border-[#263B33] hover:bg-[#1E332C]"
                              : "bg-muted text-foreground hover:bg-muted/70"
                        )}
                      >
                        {b.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Book Chapters / Sections Index (فهرس الكتب والأبواب) */}
              {activeBookContent.sections.length > 1 && (
                <div
                  data-testid="book-sections-index"
                  className={cn(
                    "rounded-2xl border p-4 sm:p-5",
                    nightMode
                      ? "bg-[#14251F] border-[#2C473D]"
                      : "bg-card border-border shadow-soft"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <ListFilter className="h-4 w-4 text-primary" />
                      <h3 className="font-display text-base sm:text-lg font-bold">
                        فهرس كتب وأبواب {selectedBook.title} (
                        {toArabicNumerals(activeBookContent.sections.length)} كتاباً)
                      </h3>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        value={chapterSearchQuery}
                        onChange={(e) => setChapterSearchQuery(e.target.value)}
                        placeholder="ابحث في الأبواب..."
                        aria-label="ابحث في أبواب الكتاب"
                        className={cn(
                          "h-9 pr-9 pl-8 text-xs rounded-xl",
                          nightMode &&
                            "bg-[#15241F] border-[#263B33] text-[#EAE3D2] placeholder:text-[#8FA39A]"
                        )}
                      />
                      {chapterSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setChapterSearchQuery("")}
                          aria-label="مسح بحث الأبواب"
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSectionNumber("all");
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-smooth",
                        activeSectionNumber === "all"
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : nightMode
                            ? "bg-[#15241F] text-[#EAE3D2] border border-[#263B33] hover:bg-[#1E332C]"
                            : "bg-muted text-foreground hover:bg-muted/70"
                      )}
                    >
                      <span>جميع أحاديث الكتاب كاملاً</span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                          activeSectionNumber === "all"
                            ? "bg-white/20 text-primary-foreground"
                            : "bg-background/80 text-muted-foreground"
                        )}
                      >
                        {toArabicNumerals(activeBookContent.hadiths.length)}
                      </span>
                    </button>

                    {displayedSections.map((sec) => {
                      const isActive = activeSectionNumber === sec.number;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => {
                            setActiveSectionNumber(sec.number);
                            setCurrentPage(1);
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-smooth text-right",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : nightMode
                                ? "bg-[#15241F] text-[#EAE3D2] border border-[#263B33] hover:bg-[#1E332C]"
                                : "bg-muted text-foreground hover:bg-muted/70"
                          )}
                        >
                          <span className="opacity-75 tabular-nums">
                            {toArabicNumerals(sec.number)}.
                          </span>
                          <span>{sec.title}</span>
                          {sec.count > 0 && (
                            <span
                              aria-hidden="true"
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                                isActive
                                  ? "bg-white/20 text-primary-foreground"
                                  : "bg-background/80 text-muted-foreground"
                              )}
                            >
                              {toArabicNumerals(sec.count)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {filteredBookSections.length > 16 && !chapterSearchQuery.trim() && (
                    <div className="mt-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllChapters((prev) => !prev)}
                        className="text-xs gap-1.5"
                      >
                        {showAllChapters ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" />
                            <span>طيّ قائمة الأبواب</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" />
                            <span>
                              عرض جميع الأبواب ({toArabicNumerals(filteredBookSections.length)} كتاباً)
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Search inside the selected complete book */}
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={bookSearchQuery}
                  onChange={(e) => {
                    setBookSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={`ابحث في جميع أحاديث ${selectedBook.title} بالمتن أو برقم الحديث...`}
                  aria-label={`ابحث في ${selectedBook.title}`}
                  className={cn(
                    "pr-10 pl-10 h-11 rounded-xl",
                    nightMode &&
                      "bg-[#15241F] border-[#263B33] text-[#EAE3D2] placeholder:text-[#8FA39A]"
                  )}
                />
                {bookSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setBookSearchQuery("");
                      setCurrentPage(1);
                    }}
                    aria-label="مسح البحث في الكتاب"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Active section & results summary */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground px-1">
                <div>
                  {activeSectionNumber === "all" ? (
                    <span>عرض جميع أبواب {selectedBook.title}</span>
                  ) : (
                    <span>
                      الباب المختار:{" "}
                      <strong className="text-foreground">
                        {
                          activeBookContent.sections.find((s) => s.number === activeSectionNumber)
                            ?.title
                        }
                      </strong>
                    </span>
                  )}
                  <span aria-hidden="true" className="mx-1.5">·</span>
                  <span>
                    عدد الأحاديث المعروضة:{" "}
                    <strong className="text-foreground">
                      {toArabicNumerals(filteredBookHadiths.length)}
                    </strong>
                  </span>
                </div>

                {totalBookPages > 1 && (
                  <span>
                    صفحة {toArabicNumerals(currentPage)} من {toArabicNumerals(totalBookPages)}
                  </span>
                )}
              </div>

              {/* Hadiths List in Book */}
              {paginatedBookHadiths.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  لا توجد أحاديث مطابقة لبحثك في {selectedBook.title}.
                </div>
              ) : (
                <div className="grid gap-4">
                  {paginatedBookHadiths.map((entry) => {
                    const favKey = `${selectedBook.edition}-${entry.hadithnumber}`;
                    const fav = isFavorite("hadith", favKey);
                    const copied = copiedId === favKey;

                    return (
                      <article
                        key={favKey}
                        className={cn(
                          "rounded-2xl border p-5 sm:p-6 transition-smooth",
                          nightMode
                            ? NIGHT_MODE_STYLES.cardStyle
                            : cn(
                                activeTheme.cardStyle,
                                "shadow-soft hover:shadow-medium hover:border-primary/30"
                              )
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  "inline-flex h-8 min-w-8 px-2 items-center justify-center rounded-full text-xs font-bold shrink-0 tabular-nums",
                                  nightMode
                                    ? "bg-[#24362F] text-[#E5C158]"
                                    : "bg-primary/10 text-primary"
                                )}
                              >
                                {toArabicNumerals(entry.hadithnumber)}
                              </span>
                              <h3
                                className={cn(
                                  "font-display text-base sm:text-lg font-bold",
                                  nightMode ? "text-[#E5C158]" : "text-primary"
                                )}
                              >
                                {entry.sectionTitle}
                              </h3>
                            </div>
                            <div
                              className={cn(
                                "flex flex-wrap items-center gap-2 text-xs",
                                nightMode ? "text-[#A7B8B0]" : "text-muted-foreground"
                              )}
                            >
                              <span>{selectedBook.title}</span>
                              <span aria-hidden="true">·</span>
                              <span>حديث رقم {toArabicNumerals(entry.hadithnumber)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyBookHadith(selectedBook, entry)}
                              aria-label="نسخ الحديث"
                              className={cn(
                                "h-8 px-2.5 gap-1 text-xs whitespace-nowrap shrink-0",
                                nightMode &&
                                  "text-[#A7B8B0] hover:text-[#EAE3D2] hover:bg-[#24362F]"
                              )}
                            >
                              {copied ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                              <span>{copied ? "تم النسخ" : "نسخ"}</span>
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleBookHadithFavorite(selectedBook, entry)}
                              aria-pressed={fav}
                              aria-label={fav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                              className={cn(
                                "gap-1.5 h-8 whitespace-nowrap shrink-0",
                                fav
                                  ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                  : nightMode &&
                                      "bg-[#15241F] border-[#263B33] text-[#EAE3D2] hover:bg-[#24362F]"
                              )}
                            >
                              <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} />
                              <span>{fav ? "في مفضلتك" : "حفظ في المفضلة"}</span>
                            </Button>
                          </div>
                        </div>

                        <p
                          className={cn(
                            "font-quran leading-loose mb-4",
                            fontClass,
                            nightMode ? "text-[#EAE3D2]" : "text-foreground"
                          )}
                        >
                          {entry.text}
                        </p>

                        <div
                          className={cn(
                            "flex flex-wrap items-center justify-between gap-2 text-xs border-t pt-3",
                            nightMode
                              ? "border-[#263B33] text-[#8FA39A]"
                              : "border-border text-muted-foreground"
                          )}
                        >
                          <span>
                            المصدر: {selectedBook.title} • {entry.sectionTitle}
                          </span>
                          <span
                            className={cn(
                              "font-semibold",
                              nightMode
                                ? "text-emerald-400"
                                : "text-emerald-700 dark:text-emerald-400"
                            )}
                          >
                            الدرجة: {entry.grade}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {totalBookPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 260, behavior: "smooth" });
                    }}
                    className="gap-1.5 rounded-xl"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>الصفحة السابقة</span>
                  </Button>

                  <span className="text-xs sm:text-sm font-medium px-3">
                    صفحة {toArabicNumerals(currentPage)} من {toArabicNumerals(totalBookPages)}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalBookPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalBookPages, p + 1));
                      window.scrollTo({ top: 260, behavior: "smooth" });
                    }}
                    className="gap-1.5 rounded-xl"
                  >
                    <span>الصفحة التالية</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* ===================================================================== */
            /* VIEW 2: MAIN HADITH LIBRARY (9 COMPLETE BOOKS GRID + JAWAMI AL-KALIM)  */
            /* ===================================================================== */
            <>
              {/* 9 Complete Hadith Books Collection Grid */}
              <div className="mb-12" data-testid="hadith-books-grid">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 text-primary text-xs sm:text-sm font-semibold mb-1">
                      <Library className="h-4 w-4" />
                      <span>دواوين السنة النبوية المشرفة</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                      مجموعات كتب الحديث الشريف الكاملة (٩ مصنّفات)
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      اختر أي مصنّف لتصفّح جميع كتبه وأبوابه الفرعية وقراءة أحاديثه كاملة بالتشكيل مع البحث الفوري
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {HADITH_BOOKS.map((book, idx) => (
                    <motion.article
                      key={book.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(idx, 5) * 0.04 }}
                      onClick={() => handleSelectBook(book)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectBook(book);
                        }
                      }}
                      aria-label={`تصفّح ${book.title} كاملاً`}
                      className={cn(
                        "group cursor-pointer rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-smooth text-right",
                        nightMode
                          ? cn(NIGHT_MODE_STYLES.cardStyle, "hover:border-[#E5C158]/50")
                          : cn(
                              activeTheme.cardStyle,
                              "shadow-soft hover:shadow-medium hover:border-primary/40"
                            )
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div
                            className={cn(
                              "inline-flex h-11 w-11 items-center justify-center rounded-xl shrink-0",
                              nightMode
                                ? "bg-[#24362F] text-[#E5C158]"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              nightMode ? "text-[#A7B8B0]" : "text-muted-foreground"
                            )}
                          >
                            {book.collectionGroup}
                          </span>
                        </div>

                        <h3
                          className={cn(
                            "font-display text-xl font-bold mb-1 group-hover:text-primary transition-smooth",
                            nightMode ? "text-[#E5C158]" : "text-foreground"
                          )}
                        >
                          {book.title}
                        </h3>

                        <p
                          className={cn(
                            "text-xs mb-3",
                            nightMode ? "text-[#A7B8B0]" : "text-muted-foreground"
                          )}
                        >
                          {book.author} ({book.deathHijri})
                        </p>

                        <p
                          className={cn(
                            "text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3",
                            nightMode ? "text-[#EAE3D2]/85" : "text-muted-foreground"
                          )}
                        >
                          {book.description}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "pt-3 border-t flex items-center justify-between gap-2 text-xs",
                          nightMode ? "border-[#263B33]" : "border-border"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1.5 font-medium",
                            nightMode ? "text-[#A7B8B0]" : "text-muted-foreground"
                          )}
                        >
                          <span>
                            {book.totalSections > 1
                              ? `${toArabicNumerals(book.totalSections)} كتاباً`
                              : "متن كامل"}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{toArabicNumerals(book.totalHadiths)} حديث</span>
                        </div>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-bold",
                            nightMode ? "text-[#E5C158]" : "text-primary"
                          )}
                        >
                          <span>تصفّح الكتاب كاملاً</span>
                          <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-smooth" />
                        </span>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>

              {/* Daily Hadith Spotlight */}
              {dailyHadith && filter === "all" && !searchQuery && (
                <div
                  data-testid="daily-hadith-card"
                  className={cn(
                    "relative rounded-2xl border p-5 sm:p-7 mb-10 overflow-hidden",
                    nightMode
                      ? "bg-[#14251F] border-[#2C473D] text-[#EAE3D2]"
                      : "bg-gradient-to-br from-amber-50/80 via-background to-emerald-50/60 border-amber-500/30 shadow-soft"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span>حديث اليوم المختار</span>
                      <span aria-hidden="true" className="text-muted-foreground">·</span>
                      <span className="font-normal text-muted-foreground">{dailyHadith.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      عن {dailyHadith.narrator}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "font-quran leading-loose mb-3",
                      fontClass,
                      nightMode ? "text-[#EAE3D2]" : "text-foreground"
                    )}
                  >
                    {dailyHadith.text}
                  </p>
                  <p
                    className={cn(
                      "text-xs sm:text-sm leading-relaxed",
                      nightMode ? "text-[#A7B8B0]" : "text-muted-foreground"
                    )}
                  >
                    <strong
                      className={cn(
                        "font-semibold",
                        nightMode ? "text-[#E5C158]" : "text-primary"
                      )}
                    >
                      من فوائد الحديث:{" "}
                    </strong>
                    {dailyHadith.explanation}
                  </p>
                </div>
              )}

              {/* Explained Jawami' al-Kalim Section */}
              <div className="pt-8 border-t border-border">
                <div className="text-center max-w-2xl mx-auto mb-6">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    جوامع الكلم والأحاديث المشروحة المختارة
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    أحاديث نبوية مختارة من الصحيحين والأربعين النووية مصنّفة موضوعياً مع شرح الفوائد المستفادة
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative mb-5">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في الأحاديث بالعنوان أو المتن أو الراوي أو الشرح..."
                    aria-label="ابحث في الأحاديث"
                    className={cn(
                      "pr-10 pl-10 h-11 rounded-xl",
                      nightMode &&
                        "bg-[#15241F] border-[#263B33] text-[#EAE3D2] placeholder:text-[#8FA39A]"
                    )}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="مسح البحث"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Interactive Category Filter Controls */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("all")}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-smooth whitespace-nowrap shrink-0",
                      filter === "all"
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : nightMode
                          ? "bg-[#15241F] text-[#EAE3D2] border border-[#263B33] hover:bg-[#1E332C]"
                          : "bg-muted text-foreground hover:bg-muted/70"
                    )}
                  >
                    <span>الكل</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                        filter === "all"
                          ? "bg-white/20 text-primary-foreground"
                          : "bg-background/80 text-muted-foreground"
                      )}
                    >
                      {categoryCounts.all ?? DEFAULT_HADITHS.length}
                    </span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-smooth whitespace-nowrap shrink-0",
                        filter === cat
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : nightMode
                            ? "bg-[#15241F] text-[#EAE3D2] border border-[#263B33] hover:bg-[#1E332C]"
                            : "bg-muted text-foreground hover:bg-muted/70"
                      )}
                    >
                      <span>{cat}</span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                          filter === cat
                            ? "bg-white/20 text-primary-foreground"
                            : "bg-background/80 text-muted-foreground"
                        )}
                      >
                        {categoryCounts[cat] ?? 0}
                      </span>
                    </button>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    {searchQuery
                      ? "لا توجد أحاديث مطابقة لبحثك."
                      : "لا توجد أحاديث في هذا القسم حالياً."}
                  </div>
                ) : (
                  <div className="grid gap-5">
                    {filtered.map((h, idx) => {
                      const fav = isFavorite("hadith", h.id);
                      const copied = copiedId === h.id;
                      const isExplanationCollapsed = Boolean(collapsedExplanations[h.id]);

                      return (
                        <motion.article
                          key={h.id}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: Math.min(idx, 5) * 0.04 }}
                          className={cn(
                            "rounded-2xl border p-5 sm:p-6 transition-smooth",
                            nightMode
                              ? NIGHT_MODE_STYLES.cardStyle
                              : cn(
                                  activeTheme.cardStyle,
                                  "shadow-soft hover:shadow-medium hover:border-primary/30"
                                )
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2.5 mb-1">
                                <span
                                  className={cn(
                                    "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 tabular-nums",
                                    nightMode
                                      ? "bg-[#24362F] text-[#E5C158]"
                                      : "bg-primary/10 text-primary"
                                  )}
                                >
                                  {toArabicNumerals(h.number)}
                                </span>
                                <h3
                                  className={cn(
                                    "font-display text-lg sm:text-xl font-bold",
                                    nightMode ? "text-[#E5C158]" : "text-primary"
                                  )}
                                >
                                  {h.title}
                                </h3>
                              </div>

                              <div
                                className={cn(
                                  "flex flex-wrap items-center gap-2 text-xs",
                                  nightMode ? "text-[#A7B8B0]" : "text-muted-foreground"
                                )}
                              >
                                <span>عن {h.narrator}</span>
                                <span aria-hidden="true">·</span>
                                <span>{h.category}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyHadith(h)}
                                aria-label="نسخ الحديث"
                                className={cn(
                                  "h-8 px-2.5 gap-1 text-xs whitespace-nowrap shrink-0",
                                  nightMode &&
                                    "text-[#A7B8B0] hover:text-[#EAE3D2] hover:bg-[#24362F]"
                                )}
                              >
                                {copied ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                <span>{copied ? "تم النسخ" : "نسخ"}</span>
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleFavorite(h)}
                                aria-pressed={fav}
                                aria-label={fav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                                className={cn(
                                  "gap-1.5 h-8 whitespace-nowrap shrink-0",
                                  fav
                                    ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                    : nightMode &&
                                        "bg-[#15241F] border-[#263B33] text-[#EAE3D2] hover:bg-[#24362F]"
                                )}
                              >
                                <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} />
                                <span>{fav ? "في مفضلتك" : "حفظ في المفضلة"}</span>
                              </Button>
                            </div>
                          </div>

                          <p
                            className={cn(
                              "font-quran leading-loose mb-4",
                              fontClass,
                              nightMode ? "text-[#EAE3D2]" : "text-foreground"
                            )}
                          >
                            {h.text}
                          </p>

                          <div
                            className={cn(
                              "rounded-xl border p-3 sm:p-4 mb-3",
                              nightMode
                                ? NIGHT_MODE_STYLES.virtueBox
                                : "bg-accent-soft border-accent/20 text-foreground/90"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => toggleExplanation(h.id)}
                              className="w-full flex items-center justify-between gap-2 text-right text-xs sm:text-sm font-semibold cursor-pointer"
                            >
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5",
                                  nightMode ? NIGHT_MODE_STYLES.virtueLabel : "text-accent-foreground"
                                )}
                              >
                                <BookOpenCheck className="h-4 w-4 shrink-0" />
                                <span>الشرح والفوائد المستفادة</span>
                              </span>
                              {isExplanationCollapsed ? (
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                            </button>
                            {!isExplanationCollapsed && (
                              <p className="mt-2 text-xs sm:text-sm leading-relaxed">
                                {h.explanation}
                              </p>
                            )}
                          </div>

                          <div
                            className={cn(
                              "flex flex-wrap items-center justify-between gap-2 text-xs border-t pt-3",
                              nightMode
                                ? "border-[#263B33] text-[#8FA39A]"
                                : "border-border text-muted-foreground"
                            )}
                          >
                            <span>{h.source}</span>
                            <span
                              className={cn(
                                "font-semibold",
                                nightMode
                                  ? "text-emerald-400"
                                  : "text-emerald-700 dark:text-emerald-400"
                              )}
                            >
                              الدرجة: {h.grade}
                            </span>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Hadith;
