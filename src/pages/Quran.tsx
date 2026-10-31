import { SEO } from "@/components/SEO";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
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

const Quran = () => {
  const [selected, setSelected] = useState<Surah | null>(null);
  const [reciter, setReciter] = useState<string>("ar.husarymujawwad");
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

  const { data: surahs = [], isPending: loading, isError: surahsError, refetch: retrySurahs } = useQuery<Surah[]>({
    queryKey: ["quran", "surahs"],
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const res = await fetch("https://api.alquran.cloud/v1/surah", { signal });
      if (!res.ok) throw new Error("Could not load surahs");
      const json = await res.json();
      if (json.code !== 200 || !Array.isArray(json.data)) throw new Error("Invalid surah response");
      return json.data;
    },
  });
  const { data: ayahs = [], isFetching: loadingAyahs, isError: ayahsError, refetch: retryAyahs } = useQuery<Ayah[]>({
    queryKey: ["quran", "ayahs", selected?.number, reciter],
    enabled: selected !== null,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async ({ signal }) => {
      if (!selected) return [];
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${selected.number}/editions/quran-uthmani-quran-academy,${reciter}`, { signal });
      if (!res.ok) throw new Error("Could not load ayahs");
      const json = await res.json();
      const text: Ayah[] | undefined = json.data?.[0]?.ayahs;
      const recordings: Ayah[] | undefined = json.data?.[1]?.ayahs;
      if (json.code !== 200 || !Array.isArray(text) || !Array.isArray(recordings)) throw new Error("Invalid ayah response");
      return text.map((a, i) => ({ numberInSurah: a.numberInSurah, number: a.number, text: a.text, audio: recordings[i]?.audio }));
    },
  });

  // Sync currentAyahIdx from global player when same surah is loaded
  const isCurrent = audio.current && selected && audio.current.surahNumber === selected.number;
  const currentAyahIdx = isCurrent ? (audio.current?.ayahIndex ?? -1) : -1;
  const playing = audio.playing && !!isCurrent;

  const openSurah = (s: Surah, reciterId: string = reciter) => {
    setSelected(s);
    setReciter(reciterId);
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const reciterName = RECITERS.find((r) => r.id === reciter)?.name || "";

  const playFromIdx = (idx: number) => {
    if (idx < 0 || idx >= ayahs.length || !selected) return;
    const url = ayahs[idx].audio;
    if (!url) return;
    audio.loadAndPlay({
      surahName: selected.name.replace(/^سُورَةُ /, ""),
      surahNumber: selected.number,
      ayahIndex: idx,
      totalAyahs: ayahs.length,
      audioUrl: url,
      reciterName,
      playlist: ayahs.map((a) => ({ audio: a.audio })),
    });
  };

  const togglePlay = () => {
    if (!isCurrent || currentAyahIdx === -1) {
      playFromIdx(0);
      return;
    }
    audio.toggle();
  };

  const handleReciterChange = (val: string) => {
    setReciter(val);
    if (selected) openSurah(selected, val);
  };

  const { nightMode, fontSize } = settings;
  const quranFontClass = FONT_SIZE_CLASSES[fontSize].quran;

  return (
    <Layout>
      <SEO />
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-700 via-pink-700 to-purple-800 text-primary-foreground py-16">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">القرآن الكريم</h1>
          <p className="text-primary-foreground/85">مصحف التلاوة برواية حفص عن عاصم</p>
        </div>
      </section>

      <section className="container py-10">
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
                ? cn(NIGHT_MODE_STYLES.sectionStyle, "p-4 sm:p-8")
                : activeTheme.id !== "default"
                  ? cn(activeTheme.sectionStyle, "p-4 sm:p-8")
                  : ""
            )}
          >
            <button
              onClick={() => setSelected(null)}
              className={cn(
                "mb-6 text-sm hover:underline",
                nightMode ? "text-[#E5C158]" : "text-primary"
              )}
            >
              ← العودة لقائمة السور
            </button>
            <div
              className={cn(
                "text-center mb-6 pb-6 border-b",
                nightMode ? "border-[#283932]" : "border-border"
              )}
            >
              <h2
                className={cn(
                  "font-quran text-4xl md:text-5xl mb-2",
                  nightMode ? "text-[#E5C158]" : "text-primary"
                )}
              >
                سورة {selected.name.replace(/^سُورَةُ /, "")}
              </h2>
              <p className={nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground"}>
                {selected.revelationType === "Meccan" ? "مكية" : "مدنية"} • {selected.numberOfAyahs} آية
              </p>
            </div>

            <div
              className={cn(
                "border rounded-xl p-4 mb-6 shadow-soft sticky top-2 z-10 backdrop-blur-sm",
                nightMode
                  ? "bg-[#17221E]/95 border-[#283932] text-[#EAE3D2]"
                  : "bg-card/95 border-border"
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
                <div className="flex items-center gap-2 justify-center">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => playFromIdx(Math.max(0, currentAyahIdx - 1))}
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
                    onClick={() => playFromIdx(Math.min(ayahs.length - 1, currentAyahIdx + 1))}
                    disabled={loadingAyahs || ayahs.length === 0}
                    aria-label="الآية التالية"
                    className={cn(nightMode && "bg-[#101815] border-[#283932] text-[#EAE3D2] hover:bg-[#1E2D27]")}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {currentAyahIdx >= 0 && (
                <p className={cn("text-xs text-center mt-2", nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground")}>
                  يتم تشغيل الآية {currentAyahIdx + 1} من {ayahs.length}
                </p>
              )}
            </div>

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
              <div
                data-testid="quran-reading-surface"
                className={cn(
                  "border rounded-2xl p-6 md:p-10 transition-colors duration-300",
                  nightMode
                    ? NIGHT_MODE_STYLES.cardStyle
                    : cn(activeTheme.cardStyle, "shadow-soft")
                )}
              >
                {selected.number !== 1 && selected.number !== 9 && (
                  <p
                    className={cn(
                      "font-quran text-3xl text-center mb-6",
                      nightMode ? "text-[#E5C158]" : "text-primary"
                    )}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                )}
                <p
                  className={cn(
                    "font-quran text-justify transition-all duration-200",
                    quranFontClass
                  )}
                  dir="rtl"
                >
                  {ayahs.map((a, idx) => (
                    <span
                      key={a.numberInSurah}
                      onClick={() => playFromIdx(idx)}
                      className={cn(
                        "cursor-pointer rounded-md px-1 transition-colors",
                        idx === currentAyahIdx
                          ? nightMode
                            ? "bg-[#283932] text-[#E5C158]"
                            : "bg-accent/30 text-primary"
                          : nightMode
                            ? "hover:bg-[#1F2F29]"
                            : "hover:bg-accent/10"
                      )}
                    >
                      {a.text}
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-9 h-9 mx-1 rounded-full text-sm font-bold border tabular-nums",
                          nightMode
                            ? "bg-[#24362F] text-[#E5C158] border-[#385247]"
                            : "bg-accent/15 text-accent-foreground border-accent/30"
                        )}
                      >
                        {a.numberInSurah}
                      </span>{" "}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : surahsError ? (
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
            <h2 className="sr-only">فهرس السور</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {surahs.map((s) => (
                <button
                  key={s.number}
                  onClick={() => openSurah(s)}
                  className={cn(
                    "group flex items-center gap-4 border rounded-xl p-4 text-right transition-smooth",
                    nightMode
                      ? cn(NIGHT_MODE_STYLES.cardStyle, "hover:border-[#E5C158]/50")
                      : cn(activeTheme.cardStyle, "hover:border-primary/40 shadow-soft hover:shadow-medium")
                  )}
                >
                  <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                    <svg className="absolute inset-0 text-accent" viewBox="0 0 40 40" fill="currentColor">
                      <path d="M20 2 L37 11 V29 L20 38 L3 29 V11 Z" opacity="0.15" />
                      <path d="M20 2 L37 11 V29 L20 38 L3 29 V11 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span
                      className={cn(
                        "relative font-display font-bold text-sm tabular-nums",
                        nightMode ? "text-[#E5C158]" : "text-accent-foreground"
                      )}
                    >
                      {s.number}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        "font-quran text-xl transition-smooth truncate",
                        nightMode
                          ? "text-[#EAE3D2] group-hover:text-[#E5C158]"
                          : "text-inherit group-hover:text-primary"
                      )}
                    >
                      {s.name}
                    </h3>
                    <p className={cn("text-xs", nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground")}>
                      {s.numberOfAyahs} آية • {s.revelationType === "Meccan" ? "مكية" : "مدنية"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Quran;
