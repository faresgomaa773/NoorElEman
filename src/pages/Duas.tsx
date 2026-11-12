import { SEO } from "@/components/SEO";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { DUA_CATEGORY_SLUGS, getDuaCategorySlug } from "@/lib/site";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookMarked, Heart, Search, X, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_DUAS } from "@/data/islamicData";
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
import { filterDuas, mergeUniqueDuas } from "@/lib/quranAndQuizUtils";
import { cn } from "@/lib/utils";

interface Dua {
  id: string;
  title: string;
  text: string;
  category: string;
  source: string | null;
}

const Duas = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const [duas, setDuas] = useState<Dua[]>(DEFAULT_DUAS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const matchedSlugMeta = categorySlug ? DUA_CATEGORY_SLUGS[categorySlug] : undefined;
  const [filter, setFilter] = useState<string>(matchedSlugMeta?.category ?? "all");

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
    if (matchedSlugMeta) {
      setFilter(matchedSlugMeta.category);
    } else if (!categorySlug) {
      setFilter("all");
    }
  }, [categorySlug, matchedSlugMeta]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("duas").select("*").order("display_order");
        if (!error && data && data.length > 0) {
          setDuas(mergeUniqueDuas(DEFAULT_DUAS, data as Dua[]));
        }
      } catch {
        // Keep DEFAULT_DUAS fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectCategory = (cat: string) => {
    setFilter(cat);
    if (cat === "all") {
      navigate("/duas");
      return;
    }
    const slug = getDuaCategorySlug(cat);
    if (slug) {
      navigate(`/duas/${slug}`);
    }
  };

  const handleToggleFavorite = (d: Dua) => {
    const added = toggleFavorite({
      sourceId: d.id,
      type: "dua",
      title: d.title,
      text: d.text,
      category: d.category,
      source: d.source,
    });
    toast({
      title: added ? "تمت الإضافة إلى مفضلتك" : "تمت الإزالة من المفضلة",
      description: added ? "يمكنك الرجوع إليها في صفحة مفضلتك" : undefined,
    });
  };

  const handleCopyDua = async (d: Dua) => {
    try {
      await navigator.clipboard?.writeText(`${d.title}\n${d.text}${d.source ? `\n— ${d.source}` : ""}`);
      setCopiedId(d.id);
      toast({ title: "تم نسخ الدعاء", description: d.title });
      setTimeout(() => setCopiedId((prev) => (prev === d.id ? null : prev)), 2000);
    } catch {
      toast({ title: "تعذّر نسخ النص", variant: "destructive" });
    }
  };

  const categories = useMemo(
    () => Array.from(new Set(duas.map((d) => d.category))),
    [duas]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: duas.length };
    for (const d of duas) {
      counts[d.category] = (counts[d.category] ?? 0) + 1;
    }
    return counts;
  }, [duas]);

  const filtered = useMemo(
    () => filterDuas(duas, filter, searchQuery),
    [duas, filter, searchQuery]
  );

  const activeCategoryMeta =
    filter !== "all"
      ? Object.values(DUA_CATEGORY_SLUGS).find((item) => item.category === filter)
      : undefined;

  const { nightMode, fontSize } = settings;
  const fontClass = FONT_SIZE_CLASSES[fontSize].azkar;

  return (
    <Layout>
      <SEO
        title={activeCategoryMeta?.title}
        description={activeCategoryMeta?.description}
        noindex={Boolean(categorySlug && !matchedSlugMeta)}
        canonicalPath={
          activeCategoryMeta
            ? `/duas/${activeCategoryMeta.slug}`
            : categorySlug
              ? `/duas/${categorySlug}`
              : "/duas"
        }
        breadcrumbs={
          activeCategoryMeta
            ? [
                { name: "الأدعية المأثورة", path: "/duas" },
                { name: `أدعية ${activeCategoryMeta.category}`, path: `/duas/${activeCategoryMeta.slug}` },
              ]
            : [{ name: "الأدعية المأثورة", path: "/duas" }]
        }
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 text-primary-foreground py-16">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <PageBreadcrumb
            items={
              activeCategoryMeta
                ? [
                    { label: "الأدعية المأثورة", to: "/duas" },
                    { label: `أدعية ${activeCategoryMeta.category}` },
                  ]
                : [{ label: "الأدعية المأثورة" }]
            }
          />
          <BookMarked className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            {activeCategoryMeta ? `الأدعية المأثورة — ${activeCategoryMeta.category}` : "الأدعية المأثورة"}
          </h1>
          <p className="text-primary-foreground/85 max-w-2xl mx-auto">
            {activeCategoryMeta?.description ?? "جوامع الدعاء من القرآن الكريم والسنة النبوية الصحيحة مصنّفة ومكتوبة بالتشكيل"}
          </p>
        </div>
      </section>

      <section className="container py-10">
        <h2 className="sr-only">قائمة الأدعية</h2>
        <div
          className={cn(
            "max-w-3xl mx-auto rounded-3xl transition-colors duration-300",
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

          {/* Search input */}
          <div className="relative mb-5">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأدعية بالعنوان أو النص أو المصدر..."
              aria-label="ابحث في الأدعية"
              className={cn(
                "pr-10 pl-10 h-11 rounded-xl",
                nightMode && "bg-[#15241F] border-[#263B33] text-[#EAE3D2] placeholder:text-[#8FA39A]"
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

          {/* Category filter pills */}
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
                {categoryCounts.all ?? duas.length}
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

          {loading ? (
            <div className="text-center text-muted-foreground py-12">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {searchQuery ? "لا توجد أدعية مطابقة لبحثك." : "لا توجد أدعية في هذا القسم حالياً."}
            </div>
          ) : (
            <div className="grid gap-5">
              {filtered.map((d, idx) => {
                const fav = isFavorite("dua", d.id);
                const copied = copiedId === d.id;
                return (
                  <motion.article
                    key={d.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(idx, 5) * 0.04 }}
                    className={cn(
                      "rounded-2xl border p-5 sm:p-6 transition-smooth",
                      nightMode
                        ? NIGHT_MODE_STYLES.cardStyle
                        : cn(activeTheme.cardStyle, "shadow-soft hover:shadow-medium hover:border-primary/30")
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3
                          className={cn(
                            "font-display text-lg sm:text-xl font-bold mb-1",
                            nightMode ? "text-[#E5C158]" : "text-primary"
                          )}
                        >
                          {d.title}
                        </h3>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                            nightMode
                              ? "bg-[#24362F] text-[#A7B8B0]"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {d.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyDua(d)}
                          aria-label="نسخ الدعاء"
                          className={cn(
                            "h-8 px-2.5 gap-1 text-xs",
                            nightMode && "text-[#A7B8B0] hover:text-[#EAE3D2] hover:bg-[#24362F]"
                          )}
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copied ? "تم النسخ" : "نسخ"}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleFavorite(d)}
                          aria-pressed={fav}
                          aria-label={fav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                          className={cn(
                            "gap-1.5 h-8 whitespace-nowrap shrink-0",
                            fav
                              ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                              : nightMode && "bg-[#15241F] border-[#263B33] text-[#EAE3D2] hover:bg-[#24362F]"
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
                      {d.text}
                    </p>
                    {d.source && (
                      <p
                        className={cn(
                          "text-xs border-t pt-3",
                          nightMode
                            ? "border-[#263B33] text-[#8FA39A]"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {d.source}
                      </p>
                    )}
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Duas;
