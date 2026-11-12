import { SEO } from "@/components/SEO";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import {
  POPULAR_SURAHS,
  createSurahSlug,
  parseSurahNumberFromSlug,
} from "@/lib/site";
import {
  filterSurahs,
  formatSurahUiName,
  getAyahAudioCandidates,
  getNextSurahNumber,
  getPrevSurahNumber,
  stripLeadingBasmalah,
  toArabicNumerals,
} from "@/lib/quranAndQuizUtils";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Loader2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Search,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuranAudio } from "@/contexts/QuranAudioContext";
import {
  FONT_SIZE_CLASSES,
  NIGHT_MODE_STYLES,
  useReadingSettings,
} from "@/hooks/useReadingSettings";
import { ReadingModeToolbar } from "@/components/ReadingModeToolbar";
import { cn } from "@/lib/utils";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  numberInSurah: number;
  number: number;
  text: string;
  audio?: string;
  audioSecondary?: string[];
  audioUrls?: string[];
}

const RECITERS = [
  { id: "ar.husary", name: "محمود خليل الحصري - مرتل" },
  { id: "ar.husarymujawwad", name: "محمود خليل الحصري - مجود" },
  { id: "ar.minshawi", name: "محمد صديق المنشاوي - مرتل" },
  { id: "ar.minshawimujawwad", name: "محمد صديق المنشاوي - مجود" },
  { id: "ar.alafasy", name: "مشاري راشد العفاسي" },
  { id: "ar.abdulbasitmurattal", name: "عبد الباسط عبد الصمد - مرتل" },
  { id: "ar.abdurrahmaansudais", name: "عبد الرحمن السديس" },
  { id: "ar.mahermuaiqly", name: "ماهر المعيقلي" },
  { id: "ar.muhammadayyoub", name: "محمد أيوب" },
  { id: "ar.hanirifai", name: "هاني الرفاعي" },
];

const INITIAL_SURAHS: Surah[] = POPULAR_SURAHS.map((s) => ({
  number: s.number,
  name: `سُورَةُ ${s.name}`,
  englishName: s.englishName,
  englishNameTranslation: s.englishName,
  numberOfAyahs: s.ayahs,
  revelationType: s.revelationType,
}));

function MushafCornerOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("w-8 h-8 sm:w-10 sm:h-10 pointer-events-none select-none", className)}
    >
      <path
        d="M2 2 H34 L28 8 H10 V26 L4 32 V2 Z"
        fill="currentColor"
        fillOpacity="0.22"
      />
      <path
        d="M2 2 H36 M2 2 V36 M7 7 H26 M7 7 V26"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="13" cy="13" r="3" fill="currentColor" fillOpacity="0.45" />
      <path d="M2 2 L16 16" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.6" />
    </svg>
  );
}

function MushafAyahMedallion({
  number,
  active,
  nightMode,
}: {
  number: number;
  active: boolean;
  nightMode: boolean;
}) {
  return (
    <span
      data-testid={`ayah-marker-${number}`}
      className={cn(
        "relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 mx-1.5 align-middle select-none transition-transform duration-200",
        active && "scale-110"
      )}
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
        className={cn(
          "absolute inset-0 w-full h-full",
          active
            ? "text-[#B8860B] dark:text-[#E5C158]"
            : nightMode
              ? "text-[#C8A24A]"
              : "text-[#B68A2E]"
        )}
      >
        {/* Outer 8-pointed Rub el Hizb star */}
        <rect
          x="8"
          y="8"
          width="28"
          height="28"
          rx="2"
          fill="currentColor"
          fillOpacity={active ? "0.28" : "0.12"}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="8"
          y="8"
          width="28"
          height="28"
          rx="2"
          transform="rotate(45 22 22)"
          fill="currentColor"
          fillOpacity={active ? "0.28" : "0.12"}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Inner medallion ring */}
        <circle
          cx="22"
          cy="22"
          r="11.5"
          fill={active ? (nightMode ? "#283932" : "#FDF3C7") : nightMode ? "#15201C" : "#FFFDF7"}
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
      <span
        className={cn(
          "relative z-10 font-display text-xs sm:text-sm font-bold leading-none pt-0.5",
          active
            ? nightMode
              ? "text-[#F3D478]"
              : "text-[#7A5200]"
            : nightMode
              ? "text-[#E5C158]"
              : "text-[#6E4B0C]"
        )}
      >
        {toArabicNumerals(number)}
      </span>
    </span>
  );
}

const Quran = () => {
  const { surahSlug } = useParams<{ surahSlug?: string }>();
  const navigate = useNavigate();
  const requestedSurahNumber = parseSurahNumberFromSlug(surahSlug);

  const [selected, setSelected] = useState<Surah | null>(() => {
    if (!requestedSurahNumber) return null;
    return INITIAL_SURAHS.find((s) => s.number === requestedSurahNumber) ?? null;
  });
  const [reciter, setReciter] = useState<string>("ar.husary");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [revelationFilter, setRevelationFilter] = useState<"all" | "Meccan" | "Medinan">("all");
  const pendingReciterResumeIdxRef = useRef<number | null>(null);

  const audio = useQuranAudio();
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

  const { data: surahs = INITIAL_SURAHS, isPending: loading, isError: surahsError, refetch: retrySurahs } = useQuery<Surah[]>({
    queryKey: ["quran", "surahs"],
    staleTime: 24 * 60 * 60 * 1000,
    placeholderData: () => INITIAL_SURAHS,
    queryFn: async ({ signal }) => {
      const res = await fetch("https://api.alquran.cloud/v1/surah", { signal });
      if (!res.ok) throw new Error("Could not load surahs");
      const json = await res.json();
      if (json.code !== 200 || !Array.isArray(json.data)) throw new Error("Invalid surah response");
      return json.data;
    },
  });

  useEffect(() => {
    if (!requestedSurahNumber) {
      setSelected(null);
      return;
    }
    const found = surahs.find((s) => s.number === requestedSurahNumber);
    if (found) {
      setSelected(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedSurahNumber]);

  useEffect(() => {
    if (!requestedSurahNumber) return;
    const found = surahs.find((s) => s.number === requestedSurahNumber);
    if (found) {
      setSelected(found);
    }
  }, [requestedSurahNumber, surahs]);

  // If audio automatically advances to the next surah while the user has a surah open,
  // seamlessly follow the new surah in the Mushaf view so reading never stops.
  const currentAudioSurahNumber = audio.current?.surahNumber;
  const isAudioPlaying = audio.playing;
  useEffect(() => {
    if (!selected || !currentAudioSurahNumber || !isAudioPlaying) return;
    if (currentAudioSurahNumber !== selected.number) {
      const nextSurah = surahs.find((s) => s.number === currentAudioSurahNumber);
      if (nextSurah) {
        setSelected(nextSurah);
        const slug = createSurahSlug(nextSurah.number, nextSurah.englishName);
        navigate(`/quran/${slug}`, { replace: true });
      }
    }
  }, [currentAudioSurahNumber, isAudioPlaying, navigate, selected, surahs]);

  const { data: ayahs = [], isFetching: loadingAyahs, isError: ayahsError, refetch: retryAyahs } = useQuery<Ayah[]>({
    queryKey: ["quran", "ayahs", selected?.number, reciter],
    enabled: selected !== null,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async ({ signal }) => {
      if (!selected) return [];
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${selected.number}/editions/quran-uthmani-quran-academy,${reciter}`,
        { signal }
      );
      if (!res.ok) throw new Error("Could not load ayahs");
      const json = await res.json();
      const text: Ayah[] | undefined = json.data?.[0]?.ayahs;
      const recordings: Ayah[] | undefined = json.data?.[1]?.ayahs;
      if (json.code !== 200 || !Array.isArray(text) || !Array.isArray(recordings)) {
        throw new Error("Invalid ayah response");
      }
      return text.map((a, i) => {
        const rec = recordings[i];
        const candidates = getAyahAudioCandidates({
          audio: rec?.audio,
          audioSecondary: rec?.audioSecondary,
          ayahGlobalNumber: a.number,
          reciterId: reciter,
        });
        return {
          numberInSurah: a.numberInSurah,
          number: a.number,
          text: a.text,
          audio: candidates[0] ?? rec?.audio,
          audioUrls: candidates,
        };
      });
    },
  });

  // Sync currentAyahIdx from global player when same surah is loaded
  const isCurrent = audio.current && selected && audio.current.surahNumber === selected.number;
  const currentAyahIdx = isCurrent ? (audio.current?.ayahIndex ?? -1) : -1;
  const playing = audio.playing && !!isCurrent;

  const reciterName = RECITERS.find((r) => r.id === reciter)?.name || "";

  const playFromIdx = (idx: number) => {
    if (idx < 0 || idx >= ayahs.length || !selected) return;
    const targetAyah = ayahs[idx];
    const url = targetAyah.audioUrls?.[0] ?? targetAyah.audio;
    if (!url) return;

    audio.loadAndPlay({
      surahName: selected.name.replace(/^سُورَةُ /, ""),
      surahNumber: selected.number,
      ayahIndex: idx,
      totalAyahs: ayahs.length,
      audioUrl: url,
      reciterName,
      reciterId: reciter,
      playlist: ayahs.map((a) => ({
        audio: a.audio,
        audioUrls: a.audioUrls,
        numberInSurah: a.numberInSurah,
      })),
    });
  };

  // If the user switched reciters while playing, seamlessly continue from the same ayah once loaded
  useEffect(() => {
    if (
      pendingReciterResumeIdxRef.current !== null &&
      !loadingAyahs &&
      ayahs.length > 0 &&
      selected
    ) {
      const resumeIdx = Math.min(pendingReciterResumeIdxRef.current, ayahs.length - 1);
      pendingReciterResumeIdxRef.current = null;
      playFromIdx(resumeIdx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahs, loadingAyahs, selected]);

  // Smoothly keep the active ayah in view during continuous recitation
  useEffect(() => {
    if (!selected || ayahs.length === 0) return;
    if (currentAyahIdx >= 0 && currentAyahIdx < ayahs.length) {
      const ayahNum = ayahs[currentAyahIdx].numberInSurah;
      const el = document.getElementById(`quran-ayah-${ayahNum}`);
      el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    }
  }, [currentAyahIdx, ayahs, selected]);

  const openSurah = (s: Surah, reciterId: string = reciter) => {
    setSelected(s);
    setReciter(reciterId);
    const slug = createSurahSlug(s.number, s.englishName);
    navigate(`/quran/${slug}`);
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const closeSurah = () => {
    setSelected(null);
    navigate("/quran");
  };

  const handleAyahClick = (idx: number) => {
    if (idx < 0 || idx >= ayahs.length || !selected) return;
    // Always start or continue uninterrupted recitation from the clicked ayah without stopping
    playFromIdx(idx);
  };

  const togglePlay = () => {
    if (!isCurrent || currentAyahIdx === -1) {
      playFromIdx(0);
      return;
    }
    audio.toggle();
  };

  const handleNextAyahOrSurah = () => {
    if (!selected || ayahs.length === 0) return;
    if (currentAyahIdx >= 0 && currentAyahIdx + 1 < ayahs.length) {
      playFromIdx(currentAyahIdx + 1);
      return;
    }
    if (currentAyahIdx === -1 && ayahs.length > 1) {
      playFromIdx(1);
      return;
    }
    // At the last ayah of the surah: advance to the next surah seamlessly
    const nextSurahNum = getNextSurahNumber(selected.number);
    const nextSurah = surahs.find((s) => s.number === nextSurahNum);
    if (nextSurah) {
      pendingReciterResumeIdxRef.current = 0;
      openSurah(nextSurah, reciter);
    } else {
      playFromIdx(0);
    }
  };

  const handlePrevAyahOrSurah = () => {
    if (!selected || ayahs.length === 0) return;
    if (currentAyahIdx > 0) {
      playFromIdx(currentAyahIdx - 1);
      return;
    }
    const prevSurahNum = getPrevSurahNumber(selected.number);
    const prevSurah = surahs.find((s) => s.number === prevSurahNum);
    if (prevSurah && currentAyahIdx === 0) {
      pendingReciterResumeIdxRef.current = 0;
      openSurah(prevSurah, reciter);
    } else {
      playFromIdx(0);
    }
  };

  const handleReciterChange = (val: string) => {
    if (playing && currentAyahIdx >= 0) {
      pendingReciterResumeIdxRef.current = currentAyahIdx;
    }
    setReciter(val);
  };

  const { nightMode, fontSize } = settings;
  const quranFontClass = FONT_SIZE_CLASSES[fontSize].quran;

  const cleanSurahName = selected ? formatSurahUiName(selected.name) : "";
  const parsedRouteSurahNumber = parseSurahNumberFromSlug(surahSlug);
  const activeSurahSlug = selected
    ? createSurahSlug(selected.number, selected.englishName)
    : parsedRouteSurahNumber !== null && surahSlug
      ? surahSlug.toLowerCase()
      : undefined;
  const surahTypeAr = selected ? (selected.revelationType === "Meccan" ? "مكية" : "مدنية") : "";

  const prevSurahObj = selected
    ? surahs.find((s) => s.number === getPrevSurahNumber(selected.number))
    : undefined;
  const nextSurahObj = selected
    ? surahs.find((s) => s.number === getNextSurahNumber(selected.number))
    : undefined;

  const filteredSurahs = filterSurahs(surahs, searchQuery, revelationFilter);

  return (
    <Layout>
      <SEO
        title={
          selected
            ? `سورة ${cleanSurahName} مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان`
            : undefined
        }
        description={
          selected
            ? `اقرأ واستمع إلى سورة ${cleanSurahName} (${surahTypeAr} - ${selected.numberOfAyahs} آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة متصلة لأشهر القراء.`
            : undefined
        }
        noindex={Boolean(surahSlug && parsedRouteSurahNumber === null)}
        canonicalPath={
          activeSurahSlug
            ? `/quran/${activeSurahSlug}`
            : surahSlug
              ? `/quran/${surahSlug}`
              : "/quran"
        }
        breadcrumbs={
          selected && activeSurahSlug
            ? [
                { name: "القرآن الكريم", path: "/quran" },
                { name: `سورة ${cleanSurahName}`, path: `/quran/${activeSurahSlug}` },
              ]
            : [{ name: "القرآن الكريم", path: "/quran" }]
        }
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white py-9 md:py-12 border-b border-[#C8A24A]/30">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <PageBreadcrumb
            items={
              selected
                ? [
                    { label: "القرآن الكريم", to: "/quran" },
                    { label: `سورة ${cleanSurahName}` },
                  ]
                : [{ label: "القرآن الكريم" }]
            }
          />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C8A24A]/20 border border-[#C8A24A]/45 text-[#F3D478] text-xs font-semibold mb-3">
            <BookOpen className="h-4 w-4" />
            <span>المصحف الشريف • بالرسم العثماني</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#FBF6EA] leading-relaxed mb-2">
            {selected ? `سورة ${cleanSurahName}` : "القرآن الكريم"}
          </h1>
          <p className="text-[#E6DEC8] text-sm sm:text-base">
            {selected
              ? `${surahTypeAr} • ${selected.numberOfAyahs} آية • مصحف التلاوة برواية حفص عن عاصم`
              : "مصحف التلاوة برواية حفص عن عاصم"}
          </p>
        </div>
      </section>

      <section className="container py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <ReadingModeToolbar
            settings={settings}
            onToggleReadingMode={toggleReadingMode}
            onToggleNightMode={toggleNightMode}
            onSetFontSize={setFontSize}
            onStepFontSize={stepFontSize}
            onSetBgTheme={setBgTheme}
            onReset={resetSettings}
          />
        </div>

        {selected ? (
          <div
            className={cn(
              "max-w-4xl mx-auto rounded-3xl transition-colors duration-300",
              nightMode
                ? cn(NIGHT_MODE_STYLES.sectionStyle, "p-3 sm:p-6")
                : activeTheme.id !== "default"
                  ? cn(activeTheme.sectionStyle, "p-3 sm:p-6")
                  : ""
            )}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <button
                type="button"
                onClick={closeSurah}
                className={cn(
                  "text-sm font-medium hover:underline",
                  nightMode ? "text-[#E5C158]" : "text-primary"
                )}
              >
                ← العودة لقائمة السور
              </button>
              <div className="flex items-center gap-2 text-xs">
                {prevSurahObj && (
                  <button
                    type="button"
                    onClick={() => openSurah(prevSurahObj, reciter)}
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors",
                      nightMode
                        ? "border-[#283932] bg-[#15201C] text-[#EAE3D2] hover:border-[#E5C158]/50"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span>السورة السابقة</span>
                  </button>
                )}
                {nextSurahObj && (
                  <button
                    type="button"
                    onClick={() => openSurah(nextSurahObj, reciter)}
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors",
                      nightMode
                        ? "border-[#283932] bg-[#15201C] text-[#EAE3D2] hover:border-[#E5C158]/50"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <span>السورة التالية</span>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Reciter & Continuous Audio Toolbar */}
            <div
              className={cn(
                "border rounded-xl p-4 mb-5 shadow-soft sticky top-2 z-20 backdrop-blur-sm",
                nightMode
                  ? "bg-[#17221E]/95 border-[#283932] text-[#EAE3D2]"
                  : "bg-card/95 border-[#C8A24A]/35"
              )}
            >
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Volume2 className={cn("h-5 w-5 shrink-0", nightMode ? "text-[#E5C158]" : "text-primary")} />
                  <Select value={reciter} onValueChange={handleReciterChange}>
                    <SelectTrigger
                      className={cn(
                        "flex-1",
                        nightMode && "bg-[#101815] border-[#283932] text-[#EAE3D2]"
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECITERS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handlePrevAyahOrSurah}
                    disabled={loadingAyahs || ayahs.length === 0}
                    aria-label="الآية السابقة"
                    className={cn(nightMode && "bg-[#101815] border-[#283932] text-[#EAE3D2] hover:bg-[#1E2D27]")}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="emerald"
                    onClick={togglePlay}
                    disabled={loadingAyahs || ayahs.length === 0}
                    aria-label={playing ? "إيقاف" : "تشغيل"}
                  >
                    {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleNextAyahOrSurah}
                    disabled={loadingAyahs || ayahs.length === 0}
                    aria-label="الآية التالية"
                    className={cn(nightMode && "bg-[#101815] border-[#283932] text-[#EAE3D2] hover:bg-[#1E2D27]")}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <span
                    data-testid="continuous-playback-badge"
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border",
                      nightMode
                        ? "bg-[#101815] border-[#283932] text-[#E5C158]"
                        : "bg-primary/10 border-primary/20 text-primary"
                    )}
                  >
                    <Repeat className="h-3.5 w-3.5" />
                    <span>تلاوة متصلة بدون توقف</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap mt-2 text-xs">
                <p className={cn(nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground")}>
                  تلاوة مستمرة تلقائياً بدون الوقوف على الآيات • اضغط على أي آية لبدء التلاوة المتصلة منها مباشرة
                </p>
                {currentAyahIdx >= 0 && (
                  <p
                    data-testid="active-ayah-indicator"
                    className={cn("font-semibold", nightMode ? "text-[#E5C158]" : "text-primary")}
                  >
                    {playing ? "يتم تشغيل" : "الآية الحالية"} الآية {currentAyahIdx + 1} من {ayahs.length}
                  </p>
                )}
              </div>
            </div>

            {/* Authentic Illuminated Mushaf Frame (تصميم المصحف الشريف) */}
            <div
              data-testid="quran-reading-surface"
              className={cn(
                "relative rounded-2xl p-2.5 sm:p-4 md:p-5 border-2 shadow-xl transition-colors duration-300",
                nightMode
                  ? "bg-[#111A16] border-[#C8A24A]/45 text-[#EAE3D2]"
                  : activeTheme.id !== "default"
                    ? cn(activeTheme.cardStyle, "border-[#C8A24A]/55")
                    : "bg-[#FBF6EA] border-[#C8A24A]/65 text-[#1F1A14]"
              )}
            >
              {/* Inner Double-Bordered Mushaf Page */}
              <div
                className={cn(
                  "relative rounded-xl border-4 border-double px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10",
                  nightMode
                    ? "border-[#C8A24A]/40 bg-[#15201C]/90"
                    : "border-[#B8892E]/50 bg-[#FDF9F0]/80"
                )}
              >
                {/* Four Corner Geometric Arabesques */}
                <MushafCornerOrnament
                  className={cn(
                    "absolute top-2 left-2",
                    nightMode ? "text-[#E5C158]" : "text-[#B68A2E]"
                  )}
                />
                <MushafCornerOrnament
                  className={cn(
                    "absolute top-2 right-2 -scale-x-100",
                    nightMode ? "text-[#E5C158]" : "text-[#B68A2E]"
                  )}
                />
                <MushafCornerOrnament
                  className={cn(
                    "absolute bottom-2 left-2 -scale-y-100",
                    nightMode ? "text-[#E5C158]" : "text-[#B68A2E]"
                  )}
                />
                <MushafCornerOrnament
                  className={cn(
                    "absolute bottom-2 right-2 -scale-x-100 -scale-y-100",
                    nightMode ? "text-[#E5C158]" : "text-[#B68A2E]"
                  )}
                />

                {/* Mushaf Top Running Margin Header (رأس صحيفة المصحف) */}
                <div
                  className={cn(
                    "flex items-center justify-between gap-2 pb-3 mb-5 border-b text-xs sm:text-sm font-display",
                    nightMode
                      ? "border-[#C8A24A]/30 text-[#E5C158]"
                      : "border-[#C8A24A]/40 text-[#7A5915]"
                  )}
                >
                  <span className="font-bold">
                    ۞ سُورَةُ {cleanSurahName}
                  </span>
                  <span className="hidden sm:inline text-xs opacity-85">
                    المُصْحَفُ الشَّرِيفُ • رِوَايَةُ حَفْصٍ عَنْ عَاصِمٍ
                  </span>
                  <span className="font-semibold">
                    {surahTypeAr} • آيَاتُهَا {toArabicNumerals(selected.numberOfAyahs)}
                  </span>
                </div>

                {/* Illuminated Surah Title Cartouche (لافتة اسم السورة المزخرفة) */}
                <div
                  data-testid="mushaf-surah-banner"
                  className={cn(
                    "relative overflow-hidden rounded-xl border-2 mb-6 px-4 py-6 sm:px-6 sm:py-7 text-center shadow-sm",
                    nightMode
                      ? "border-[#C8A24A]/55 bg-gradient-to-r from-[#1A2822] via-[#21332B] to-[#1A2822]"
                      : "border-[#B8892E]/65 bg-gradient-to-r from-[#F4E7C5] via-[#FBF3DC] to-[#F4E7C5]"
                  )}
                >
                  <div className="absolute inset-0 pattern-arabesque opacity-15 pointer-events-none" />
                  <div className="relative flex items-center justify-between gap-2 sm:gap-4">
                    {/* Right Medallion */}
                    <div
                      className={cn(
                        "hidden sm:flex flex-col items-center justify-center px-3.5 py-2 rounded-lg border text-xs font-display font-semibold shrink-0",
                        nightMode
                          ? "border-[#C8A24A]/45 bg-[#111A16]/80 text-[#E5C158]"
                          : "border-[#B8892E]/50 bg-[#FFFDF7]/90 text-[#6E4B0C]"
                      )}
                    >
                      <span>ترتيبها</span>
                      <span className="text-sm font-bold">{toArabicNumerals(selected.number)}</span>
                    </div>

                    {/* Center Surah Title */}
                    <div className="flex-1 text-center py-1">
                      <h2
                        className={cn(
                          "font-quran text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.85]",
                          nightMode ? "text-[#F3D478]" : "text-[#4A3208]"
                        )}
                      >
                        سورة {cleanSurahName}
                      </h2>
                      <p
                        className={cn(
                          "text-xs sm:text-sm mt-1 font-medium",
                          nightMode ? "text-[#C5BDA8]" : "text-[#6E531D]"
                        )}
                      >
                        {surahTypeAr} • {selected.numberOfAyahs} آية
                      </p>
                    </div>

                    {/* Left Medallion */}
                    <div
                      className={cn(
                        "hidden sm:flex flex-col items-center justify-center px-3.5 py-2 rounded-lg border text-xs font-display font-semibold shrink-0",
                        nightMode
                          ? "border-[#C8A24A]/45 bg-[#111A16]/80 text-[#E5C158]"
                          : "border-[#B8892E]/50 bg-[#FFFDF7]/90 text-[#6E4B0C]"
                      )}
                    >
                      <span>آياتها</span>
                      <span className="text-sm font-bold">
                        {toArabicNumerals(selected.numberOfAyahs)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ornamental Basmalah (for all surahs except Al-Fatihah #1 and At-Tawbah #9) */}
                {selected.number !== 1 && selected.number !== 9 && (
                  <div className="text-center my-6">
                    <p
                      className={cn(
                        "inline-block font-quran text-2xl sm:text-3xl md:text-4xl px-6 py-2.5 rounded-full border leading-[1.8]",
                        nightMode
                          ? "text-[#F3D478] border-[#C8A24A]/35 bg-[#111A16]/60"
                          : "text-[#4A3208] border-[#C8A24A]/45 bg-[#F7EED6]/60"
                      )}
                    >
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                )}

                {loadingAyahs ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : ayahsError ? (
                  <div className="text-center py-12" role="alert">
                    <p className="text-destructive mb-4">تعذّر تحميل السورة.</p>
                    <Button variant="outline" onClick={() => retryAyahs()}>إعادة المحاولة</Button>
                  </div>
                ) : (
                  /* Mushaf Continuous Verse Flow */
                  <p
                    className={cn(
                      "font-quran text-justify px-1 sm:px-3 transition-all duration-200",
                      quranFontClass
                    )}
                    dir="rtl"
                  >
                    {ayahs.map((a, idx) => {
                      const isAyahActive = idx === currentAyahIdx;
                      const displayText = stripLeadingBasmalah(
                        a.text,
                        selected.number,
                        a.numberInSurah
                      );

                      return (
                        <span
                          key={a.numberInSurah}
                          id={`quran-ayah-${a.numberInSurah}`}
                          data-ayah-number={a.numberInSurah}
                          onClick={() => handleAyahClick(idx)}
                          className={cn(
                            "cursor-pointer rounded-lg px-1.5 py-0.5 transition-colors",
                            isAyahActive
                              ? nightMode
                                ? "bg-[#283932] text-[#F3D478] shadow-sm"
                                : "bg-[#F3E1AE]/80 text-[#3B2604] shadow-sm"
                              : nightMode
                                ? "hover:bg-[#1F2F29]"
                                : "hover:bg-[#EFE2BE]/55"
                          )}
                        >
                          {displayText}{" "}
                          <MushafAyahMedallion
                            number={a.numberInSurah}
                            active={isAyahActive}
                            nightMode={nightMode}
                          />{" "}
                        </span>
                      );
                    })}
                  </p>
                )}

                {/* Mushaf Bottom Seal & Surah Navigation */}
                <div
                  className={cn(
                    "mt-8 pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4",
                    nightMode ? "border-[#C8A24A]/30" : "border-[#C8A24A]/40"
                  )}
                >
                  {prevSurahObj ? (
                    <button
                      type="button"
                      onClick={() => openSurah(prevSurahObj, reciter)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-semibold px-3.5 py-2 rounded-lg border transition-colors",
                        nightMode
                          ? "border-[#C8A24A]/40 bg-[#111A16] text-[#E5C158] hover:bg-[#1E2D27]"
                          : "border-[#B8892E]/45 bg-[#F6EBD0] text-[#5C3E09] hover:bg-[#EFE0BA]"
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span>سورة {formatSurahUiName(prevSurahObj.name)}</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-1 rounded-full border text-xs sm:text-sm font-display font-bold",
                      nightMode
                        ? "border-[#C8A24A]/40 bg-[#111A16] text-[#E5C158]"
                        : "border-[#B8892E]/45 bg-[#F6EBD0] text-[#5C3E09]"
                    )}
                  >
                    <span>۞</span>
                    <span>صَدَقَ اللَّهُ العَظِيمُ</span>
                    <span>•</span>
                    <span>{toArabicNumerals(selected.number)}</span>
                  </div>

                  {nextSurahObj ? (
                    <button
                      type="button"
                      onClick={() => openSurah(nextSurahObj, reciter)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-semibold px-3.5 py-2 rounded-lg border transition-colors",
                        nightMode
                          ? "border-[#C8A24A]/40 bg-[#111A16] text-[#E5C158] hover:bg-[#1E2D27]"
                          : "border-[#B8892E]/45 bg-[#F6EBD0] text-[#5C3E09] hover:bg-[#EFE0BA]"
                      )}
                    >
                      <span>سورة {formatSurahUiName(nextSurahObj.name)}</span>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              </div>
            </div>
          </div>

        ) : loading && surahs.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : surahsError && surahs.length === 0 ? (
          <div className="text-center py-12" role="alert">
            <p className="text-destructive mb-4">تعذّر تحميل قائمة السور.</p>
            <Button variant="outline" onClick={() => retrySurahs()}>إعادة المحاولة</Button>
          </div>
        ) : (
          <div
            className={cn(
              "max-w-6xl mx-auto rounded-3xl transition-colors duration-300",
              nightMode
                ? cn(NIGHT_MODE_STYLES.sectionStyle, "p-4 sm:p-6")
                : activeTheme.id !== "default"
                  ? cn(activeTheme.sectionStyle, "p-4 sm:p-6")
                  : ""
            )}
          >
            {/* Mushaf Index Header, Search & Revelation Filter */}
            <div
              className={cn(
                "rounded-2xl border-2 p-4 sm:p-6 mb-6",
                nightMode
                  ? "bg-[#15201C] border-[#C8A24A]/40 text-[#EAE3D2]"
                  : "bg-[#FBF6EA] border-[#C8A24A]/50 text-[#1F1A14]"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2
                    className={cn(
                      "font-display text-xl sm:text-2xl font-bold",
                      nightMode ? "text-[#F3D478]" : "text-[#4A3208]"
                    )}
                  >
                    فهرس السور • المصحف الشريف
                  </h2>
                  <p className={cn("text-xs sm:text-sm mt-1", nightMode ? "text-[#C5BDA8]" : "text-[#6E531D]")}>
                    اختر السورة للقراءة بالرسم العثماني والاستماع للتلاوة المتصلة
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative min-w-[220px]">
                    <Search
                      className={cn(
                        "h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
                        nightMode ? "text-[#E5C158]" : "text-[#7A5915]"
                      )}
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث باسم السورة أو رقمها..."
                      aria-label="ابحث باسم السورة أو رقمها"
                      className={cn(
                        "w-full rounded-xl border pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2",
                        nightMode
                          ? "bg-[#101815] border-[#283932] text-[#EAE3D2] placeholder:text-[#8E9B94] focus:ring-[#E5C158]/40"
                          : "bg-[#FFFDF7] border-[#C8A24A]/45 text-[#1F1A14] placeholder:text-[#8A7248] focus:ring-[#B8892E]/40"
                      )}
                    />
                  </div>

                  <div className="inline-flex rounded-xl border p-1 gap-1 bg-black/5 dark:bg-white/5 border-[#C8A24A]/35">
                    {(
                      [
                        { id: "all", label: "الكل" },
                        { id: "Meccan", label: "مكية" },
                        { id: "Medinan", label: "مدنية" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setRevelationFilter(tab.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                          revelationFilter === tab.id
                            ? nightMode
                              ? "bg-[#E5C158] text-[#111A16]"
                              : "bg-[#6E4B0C] text-[#FFFDF7]"
                            : nightMode
                              ? "text-[#EAE3D2] hover:bg-[#1E2D27]"
                              : "text-[#5C3E09] hover:bg-[#EFE2BE]"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {filteredSurahs.length === 0 ? (
              <div className="text-center py-12">
                <p className={cn("text-sm mb-3", nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground")}>
                  لا توجد سورة مطابقة لبحثك «{searchQuery}».
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setRevelationFilter("all");
                  }}
                >
                  عرض جميع السور
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredSurahs.map((s) => (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => openSurah(s, reciter)}
                    className={cn(
                      "group relative flex items-center gap-4 border-2 rounded-xl p-4 text-right transition-smooth overflow-hidden",
                      nightMode
                        ? "bg-[#15201C] border-[#283932] hover:border-[#E5C158]/60 text-[#EAE3D2]"
                        : activeTheme.id !== "default"
                          ? cn(activeTheme.cardStyle, "hover:border-[#B8892E]/60 shadow-soft")
                          : "bg-[#FBF6EA] border-[#C8A24A]/40 hover:border-[#B8892E] shadow-soft hover:shadow-medium text-[#1F1A14]"
                    )}
                  >
                    {/* Ornate 8-Pointed Rub el Hizb Surah Number Medallion */}
                    <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                      <svg
                        className={cn(
                          "absolute inset-0 w-full h-full transition-transform duration-300 group-hover:rotate-12",
                          nightMode ? "text-[#E5C158]" : "text-[#B68A2E]"
                        )}
                        viewBox="0 0 44 44"
                        fill="none"
                      >
                        <rect
                          x="8"
                          y="8"
                          width="28"
                          height="28"
                          rx="2"
                          fill="currentColor"
                          fillOpacity="0.14"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                        <rect
                          x="8"
                          y="8"
                          width="28"
                          height="28"
                          rx="2"
                          transform="rotate(45 22 22)"
                          fill="currentColor"
                          fillOpacity="0.14"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </svg>
                      <span
                        className={cn(
                          "relative font-display font-bold text-sm tabular-nums",
                          nightMode ? "text-[#F3D478]" : "text-[#5C3E09]"
                        )}
                      >
                        {toArabicNumerals(s.number)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-quran text-xl transition-smooth truncate",
                          nightMode
                            ? "text-[#EAE3D2] group-hover:text-[#F3D478]"
                            : "text-[#2B1E08] group-hover:text-primary"
                        )}
                      >
                        {s.name}
                      </h3>
                      <p className={cn("text-xs", nightMode ? NIGHT_MODE_STYLES.mutedText : "text-[#6E531D]")}>
                        {toArabicNumerals(s.numberOfAyahs)} آية • {s.revelationType === "Meccan" ? "مكية" : "مدنية"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Quran;



