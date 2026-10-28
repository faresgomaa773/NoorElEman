import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sun, RotateCcw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_AZKAR } from "@/data/islamicData";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  FONT_SIZE_CLASSES,
  NIGHT_MODE_STYLES,
  useReadingSettings,
} from "@/hooks/useReadingSettings";
import { ReadingModeToolbar } from "@/components/ReadingModeToolbar";
import { cn } from "@/lib/utils";

interface Zikr {
  id: string;
  text: string;
  repeat_count: number;
  virtue: string | null;
  source: string | null;
}

interface Props {
  category: "morning" | "evening";
  title: string;
  subtitle: string;
  Icon: typeof Sun;
  gradient: string;
}

export function AzkarPage({ category, title, subtitle, Icon, gradient }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
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

  const { data: azkar = [], isPending: loading, isError, refetch } = useQuery<Zikr[]>({
    queryKey: ["azkar", category],
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      try {
        const { data, error } = await supabase
          .from("azkar")
          .select("id, text, repeat_count, virtue, source")
          .eq("category", category)
          .order("display_order")
          .abortSignal(signal);
        if (!error && data && data.length > 0) return data;
      } catch {
        // Fallback to local authentic Azkar
      }
      return DEFAULT_AZKAR.filter((z) => z.category === category);
    },
  });

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

  const reset = (id: string) => setCounts((p) => ({ ...p, [id]: 0 }));

  const { nightMode, fontSize } = settings;
  const fontClass = FONT_SIZE_CLASSES[fontSize].azkar;

  return (
    <Layout>
      <section className={`relative overflow-hidden bg-gradient-to-br ${gradient} text-primary-foreground py-16`}>
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <Icon className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">{title}</h1>
          <p className="text-primary-foreground/85 max-w-xl mx-auto">{subtitle}</p>
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

          {loading ? (
            <div className="text-center text-muted-foreground py-12">جاري التحميل...</div>
          ) : isError ? (
            <div className="text-center py-12" role="alert">
              <p className="text-destructive mb-4">تعذّر تحميل الأذكار، حاول مرة أخرى.</p>
              <Button variant="outline" onClick={() => refetch()}>إعادة المحاولة</Button>
            </div>
          ) : azkar.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">لا توجد أذكار حالياً.</div>
          ) : (
            <div className="grid gap-4 sm:gap-5">
              {azkar.map((z, idx) => {
                const count = counts[z.id] ?? 0;
                const done = count >= z.repeat_count;
                const progress = (count / z.repeat_count) * 100;
                const remaining = Math.max(0, z.repeat_count - count);
                return (
                  <motion.div
                    key={z.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(idx, 4) * 0.05 }}
                    className={cn(
                      "group relative rounded-2xl border p-3 sm:p-4 md:p-5 transition-smooth",
                      nightMode
                        ? done
                          ? "bg-[#152920] border-emerald-600/50 text-[#EAE3D2]"
                          : NIGHT_MODE_STYLES.cardStyle
                        : done
                          ? "border-success/40 bg-success/5"
                          : cn(activeTheme.cardStyle, "shadow-soft hover:shadow-medium hover:border-primary/40")
                    )}
                  >
                    {/* progress bar on top */}
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

                    <div className="flex items-start gap-2 sm:gap-3 mb-3">
                      {/* index badge */}
                      <div
                        className={cn(
                          "hidden sm:flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 mt-1 tabular-nums",
                          nightMode
                            ? "bg-[#24362F] text-[#E5C158]"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {idx + 1}
                      </div>

                      {/* dhikr text */}
                      <button
                        onClick={() => increment(z.id, z.repeat_count)}
                        disabled={done}
                        className={cn(
                          "flex-1 min-w-0 text-right font-quran tracking-wide rounded-xl px-2 sm:px-3 py-2 transition-smooth cursor-pointer break-words",
                          fontClass,
                          done
                            ? nightMode
                              ? "text-emerald-300 bg-emerald-950/40"
                              : "text-success/90 bg-success/10"
                            : nightMode
                              ? "text-[#EAE3D2] hover:bg-[#1F2F29] active:bg-[#263932] focus-visible:outline-none"
                              : "text-inherit hover:bg-accent/15 active:bg-accent/25 focus-visible:bg-accent/15 focus-visible:outline-none"
                        )}
                      >
                        <span
                          className={cn(
                            "sm:hidden inline-flex items-center justify-center h-6 w-6 me-2 rounded-full text-[11px] font-bold align-middle tabular-nums",
                            nightMode
                              ? "bg-[#24362F] text-[#E5C158]"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {idx + 1}
                        </span>
                        {z.text}
                      </button>

                      {/* side counter */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          onClick={() => increment(z.id, z.repeat_count)}
                          disabled={done}
                          aria-label="عدّ الذكر"
                          className={cn(
                            "relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-2xl font-display font-extrabold text-lg sm:text-xl md:text-2xl transition-spring shadow-soft tabular-nums",
                            done
                              ? "bg-success text-success-foreground"
                              : "bg-gradient-emerald text-primary-foreground hover:scale-105 hover:shadow-glow active:scale-95"
                          )}
                        >
                          {done ? <Check className="h-5 w-5 sm:h-6 sm:w-6 mx-auto" /> : remaining}
                        </button>
                        <span
                          className={cn(
                            "text-[10px] sm:text-[11px] font-medium leading-none tabular-nums",
                            nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground"
                          )}
                        >
                          {count}/{z.repeat_count}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => reset(z.id)}
                          className={cn(
                            "h-6 w-6",
                            nightMode
                              ? "text-[#A7B8B0] hover:text-[#EAE3D2] hover:bg-[#24362F]"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          aria-label="إعادة"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {z.virtue && (
                      <div
                        className={cn(
                          "rounded-xl border p-2.5 sm:p-3 mb-2 text-xs sm:text-sm leading-relaxed",
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
                        {z.virtue}
                      </div>
                    )}
                    {z.source && (
                      <p
                        className={cn(
                          "text-[11px] sm:text-xs mt-1.5",
                          nightMode ? NIGHT_MODE_STYLES.mutedText : "text-muted-foreground"
                        )}
                      >
                        {z.source}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
