import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  BookMarked,
  ArrowLeft,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useFavorites, type FavoriteItem } from "@/hooks/useFavorites";
import {
  FONT_SIZE_CLASSES,
  NIGHT_MODE_STYLES,
  useReadingSettings,
} from "@/hooks/useReadingSettings";
import { ReadingModeToolbar } from "@/components/ReadingModeToolbar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FilterType = "all" | "azkar" | "dua";

const Favorites = () => {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const [filter, setFilter] = useState<FilterType>("all");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const { nightMode, fontSize } = settings;
  const fontClass = FONT_SIZE_CLASSES[fontSize].azkar;

  const filtered =
    filter === "all"
      ? favorites
      : favorites.filter((item) => item.type === filter);

  const azkarCount = favorites.filter((f) => f.type === "azkar").length;
  const duaCount = favorites.filter((f) => f.type === "dua").length;

  const increment = (id: string, max: number) => {
    setCounts((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.min(current + 1, max);
      if (next === max && current < max) {
        toast({ title: "أتممت الذكر", description: "تقبّل الله منك" });
      }
      return { ...prev, [id]: next };
    });
  };

  const resetCounter = (id: string) => {
    setCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleCopy = async (item: FavoriteItem) => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      toast({ title: "تم النسخ", description: "تم نسخ النص إلى الحافظة" });
      setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 2000);
    } catch {
      toast({ title: "تعذّر النسخ", variant: "destructive" });
    }
  };

  const handleRemove = (item: FavoriteItem) => {
    removeFavorite(item.id);
    toast({ title: "تمت الإزالة من مفضلتك" });
  };

  const handleClearAll = () => {
    clearFavorites();
    setCounts({});
    toast({ title: "تم مسح المفضلة بالكامل" });
  };

  return (
    <Layout>
      <SEO
        title="مفضلتك | الأذكار والأدعية المحفوظة | نور الإيمان"
        description="تصفّح الأذكار والأدعية التي حفظتها في مفضلتك لقراءتها والمداومة عليها يومياً."
        keywords="مفضلتك, المفضلة, أذكار محفوظة, أدعية محفوظة, نور الإيمان"
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-900 text-primary-foreground py-16">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-accent fill-accent/20" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">مفضلتك</h1>
          <p className="text-primary-foreground/85 max-w-xl mx-auto">
            الأذكار والأدعية التي اخترتها لتكون قريبة منك في كل وقت
          </p>
        </div>
      </section>

      <section className="container py-10">
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

          {/* Filter Tabs & Clear All */}
          {favorites.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              <div
                className={cn(
                  "inline-flex items-center gap-1 p-1 rounded-xl border",
                  nightMode
                    ? "bg-[#101815] border-[#283932]"
                    : "bg-muted/50 border-border"
                )}
              >
                {[
                  { id: "all" as FilterType, label: `الكل (${favorites.length})` },
                  { id: "azkar" as FilterType, label: `الأذكار (${azkarCount})` },
                  { id: "dua" as FilterType, label: `الأدعية (${duaCount})` },
                ].map((tab) => {
                  const active = filter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilter(tab.id)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 tabular-nums",
                        active
                          ? nightMode
                            ? "bg-[#283932] text-[#E5C158] shadow-sm"
                            : "bg-primary text-primary-foreground shadow-sm"
                          : nightMode
                            ? "text-[#A7B8B0] hover:text-[#EAE3D2]"
                            : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className={cn(
                  "gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 whitespace-nowrap shrink-0",
                  nightMode && "bg-[#101815] border-red-900/50 text-red-400 hover:bg-red-950/40"
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>مسح المفضلة</span>
              </Button>
            </div>
          )}

          {/* Content */}
          {favorites.length === 0 ? (
            <div
              className={cn(
                "rounded-2xl border p-8 sm:p-12 text-center",
                nightMode
                  ? NIGHT_MODE_STYLES.cardStyle
                  : cn(activeTheme.cardStyle, "shadow-soft")
              )}
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                قائمة مفضلتك فارغة حالياً
              </h2>
              <p
                className={cn(
                  "text-sm max-w-md mx-auto mb-8 leading-relaxed",
                  nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground"
                )}
              >
                يمكنك حفظ الأذكار والأدعية التي تقرؤها باستمرار بالضغط على زر القلب في صفحات الأذكار والأدعية للوصول السريع إليها هنا.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="emerald">
                  <Link to="/morning">
                    <Sun className="h-4 w-4" />
                    <span>أذكار الصباح</span>
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/evening">
                    <Moon className="h-4 w-4" />
                    <span>أذكار المساء</span>
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/duas">
                    <BookMarked className="h-4 w-4" />
                    <span>الأدعية المأثورة</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد عناصر محفوظة في هذا التصنيف.
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5">
              {filtered.map((item) => {
                const isZikr = item.type === "azkar";
                const maxRepeat = item.repeat_count ?? 1;
                const count = counts[item.id] ?? 0;
                const done = isZikr && count >= maxRepeat;
                const progress = isZikr ? (count / maxRepeat) * 100 : 0;
                const remaining = Math.max(0, maxRepeat - count);

                const categoryLabel =
                  item.category === "morning"
                    ? "أذكار الصباح"
                    : item.category === "evening"
                      ? "أذكار المساء"
                      : item.category;

                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "group relative rounded-2xl border p-4 sm:p-6 transition-smooth",
                      nightMode
                        ? done
                          ? "bg-[#152920] border-emerald-600/50 text-[#EAE3D2]"
                          : NIGHT_MODE_STYLES.cardStyle
                        : done
                          ? "border-success/40 bg-success/5"
                          : cn(activeTheme.cardStyle, "shadow-soft hover:shadow-medium")
                    )}
                  >
                    {isZikr && (
                      <div
                        className={cn(
                          "absolute top-0 inset-x-0 h-1 rounded-t-2xl overflow-hidden",
                          nightMode ? "bg-[#24332D]" : "bg-muted"
                        )}
                      >
                        <div
                          className="h-full bg-gradient-gold transition-smooth"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}

                    {/* Top metadata & actions row */}
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div
                        className={cn(
                          "flex items-center gap-2 text-xs font-medium",
                          nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "font-bold",
                            nightMode ? "text-[#E5C158]" : "text-primary"
                          )}
                        >
                          {item.title || categoryLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{isZikr ? "ذكر" : "دعاء"}</span>
                        {item.title && item.title !== categoryLabel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{categoryLabel}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(item)}
                          aria-label="نسخ النص"
                          className={cn(
                            "h-8 px-2.5 text-xs gap-1",
                            nightMode && "text-[#A7B8B0] hover:text-[#EAE3D2] hover:bg-[#24362F]"
                          )}
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copiedId === item.id ? "تم النسخ" : "نسخ"}</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemove(item)}
                          aria-label="إزالة من المفضلة"
                          className={cn(
                            "h-8 px-2.5 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10",
                            nightMode && "text-red-400 hover:bg-red-950/40"
                          )}
                        >
                          <Heart className="h-3.5 w-3.5 fill-current" />
                          <span>إزالة</span>
                        </Button>
                      </div>
                    </div>

                    {/* Main Content & Optional Azkar Counter */}
                    <div className="flex items-start gap-3">
                      {isZikr ? (
                        <button
                          type="button"
                          onClick={() => increment(item.id, maxRepeat)}
                          disabled={done}
                          className={cn(
                            "flex-1 min-w-0 text-right font-quran tracking-wide rounded-xl px-2 py-1.5 transition-smooth cursor-pointer break-words",
                            fontClass,
                            done
                              ? nightMode
                                ? "text-emerald-300 bg-emerald-950/40"
                                : "text-success/90 bg-success/10"
                              : nightMode
                                ? "text-[#EAE3D2] hover:bg-[#1F2F29]"
                                : "text-inherit hover:bg-accent/15"
                          )}
                        >
                          {item.text}
                        </button>
                      ) : (
                        <p
                          className={cn(
                            "flex-1 min-w-0 font-quran tracking-wide break-words mb-2",
                            fontClass
                          )}
                        >
                          {item.text}
                        </p>
                      )}

                      {isZikr && (
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => increment(item.id, maxRepeat)}
                            disabled={done}
                            aria-label="عدّ الذكر"
                            className={cn(
                              "relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl font-display font-extrabold text-lg sm:text-xl transition-spring shadow-soft tabular-nums",
                              done
                                ? "bg-success text-success-foreground"
                                : "bg-gradient-emerald text-primary-foreground hover:scale-105 active:scale-95"
                            )}
                          >
                            {done ? <Check className="h-5 w-5 mx-auto" /> : remaining}
                          </button>
                          <span
                            className={cn(
                              "text-[10px] sm:text-[11px] font-medium leading-none tabular-nums",
                              nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground"
                            )}
                          >
                            {count}/{maxRepeat}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => resetCounter(item.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            aria-label="إعادة"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {item.virtue && (
                      <div
                        className={cn(
                          "rounded-xl border p-2.5 sm:p-3 mt-3 mb-2 text-xs sm:text-sm leading-relaxed",
                          nightMode
                            ? NIGHT_MODE_STYLES.virtueBox
                            : "bg-accent-soft border-accent/20 text-foreground/85"
                        )}
                      >
                        <span
                          className={cn(
                            "font-semibold",
                            nightMode ? NIGHT_MODE_STYLES.virtueLabel : "text-accent-foreground"
                          )}
                        >
                          الفضل:{" "}
                        </span>
                        {item.virtue}
                      </div>
                    )}

                    {item.source && (
                      <p
                        className={cn(
                          "text-[11px] sm:text-xs mt-2 pt-2 border-t",
                          nightMode
                            ? cn(NIGHT_MODE_STYLES.mutedText, "border-[#283932]")
                            : "text-muted-foreground border-border/60"
                        )}
                      >
                        {item.source}
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

export default Favorites;
