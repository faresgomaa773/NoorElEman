import { SEO } from "@/components/SEO";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const PHRASES = [
  { ar: "سُبْحَانَ اللَّهِ", target: 33 },
  { ar: "الْحَمْدُ لِلَّهِ", target: 33 },
  { ar: "اللَّهُ أَكْبَرُ", target: 34 },
  { ar: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100 },
  { ar: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
  { ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100 },
  { ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 100 },
];

const STORAGE_KEY = "tasbih-state-v1";

interface State {
  phraseIdx: number;
  count: number;
  total: number;
  history: { phrase: string; count: number; date: string }[];
}

const loadState = (): State => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      const validIdx =
        typeof parsed.phraseIdx === "number" &&
        parsed.phraseIdx >= 0 &&
        parsed.phraseIdx < PHRASES.length
          ? parsed.phraseIdx
          : 0;
      return {
        phraseIdx: validIdx,
        count: typeof parsed.count === "number" ? parsed.count : 0,
        total: typeof parsed.total === "number" ? parsed.total : 0,
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    }
  } catch {
    // Fallback to initial state if storage is unavailable or corrupted
  }
  return { phraseIdx: 0, count: 0, total: 0, history: [] };
};

const Tasbih = () => {
  const [state, setState] = useState<State>(loadState);
  const phrase = PHRASES[state.phraseIdx] ?? PHRASES[0];
  const progress = Math.min(100, (state.count / phrase.target) * 100);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write errors
    }
  }, [state]);

  const increment = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(15);
    setState((s) => {
      const next = s.count + 1;
      if (next === phrase.target) {
        toast({ title: "أكملت العدد المستحب 🌙", description: phrase.ar });
      }
      return { ...s, count: next, total: s.total + 1 };
    });
  };

  const reset = () => {
    setState((s) => {
      const newHistory = s.count > 0
        ? [{ phrase: phrase.ar, count: s.count, date: new Date().toISOString() }, ...s.history].slice(0, 10)
        : s.history;
      return { ...s, count: 0, history: newHistory };
    });
  };

  const changePhrase = (delta: number) => {
    reset();
    setState((s) => ({ ...s, phraseIdx: (s.phraseIdx + delta + PHRASES.length) % PHRASES.length, count: 0 }));
  };

  const resetAll = () => {
    setState({ phraseIdx: 0, count: 0, total: 0, history: [] });
    toast({ title: "تم مسح السجل", description: "تمت إعادة ضبط الإحصائيات بنجاح" });
  };

  return (
    <Layout>
      <SEO
        title="السبحة الإلكترونية | تسبيح وذكر | نور الإيمان"
        description="سبحة إلكترونية لتسبيح الله وذكره، تابع عددك التراكمي اليومي بسهولة."
        keywords="سبحة إلكترونية, تسبيح, ذكر, سبحان الله, الحمد لله, نور الإيمان"
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-primary-foreground py-16">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">السبحة الإلكترونية</h1>
          <p className="text-primary-foreground/85">سبّح واذكر الله مع تتبّع تلقائي لعددك</p>
        </div>
      </section>

      <section className="container py-12 max-w-xl">
        {/* Phrase selector */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => changePhrase(-1)} aria-label="السابق">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center">
            <p className="font-quran text-2xl text-foreground">{phrase.ar}</p>
            <p className="text-xs text-muted-foreground mt-1">الهدف: {phrase.target}</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => changePhrase(1)} aria-label="التالي">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Counter */}
        <Card className="p-8 bg-gradient-card text-center mb-6">
          <button
            onClick={increment}
            className="relative w-56 h-56 mx-auto rounded-full bg-gradient-emerald shadow-glow active:scale-95 transition-spring select-none"
            aria-label="عدّ"
          >
            {/* Progress ring */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--background) / 0.25)" strokeWidth="4" />
              <motion.circle
                cx="50" cy="50" r="46" fill="none"
                stroke="hsl(var(--accent))" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 46}
                animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - progress / 100) }}
                transition={{ type: "spring", damping: 20, stiffness: 120 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
              <motion.span
                key={state.count}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display text-6xl font-bold"
              >
                {state.count}
              </motion.span>
              <span className="text-sm opacity-80 mt-1">/ {phrase.target}</span>
            </div>
          </button>

          <div className="flex justify-center gap-3 mt-6">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> تصفير
            </Button>
            <Button variant="emerald" onClick={increment}>
              <Sparkles className="h-4 w-4" /> سبّح
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <h2 className="sr-only">إحصائيات التسبيح</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-5 text-center bg-gradient-card">
            <p className="text-xs text-muted-foreground mb-1">العدد الحالي</p>
            <p className="font-display text-3xl font-bold text-primary">{state.count}</p>
          </Card>
          <Card className="p-5 text-center bg-gradient-card">
            <p className="text-xs text-muted-foreground mb-1">الإجمالي الكلي</p>
            <p className="font-display text-3xl font-bold text-accent">{state.total}</p>
          </Card>
        </div>

        {/* History */}
        {state.history.length > 0 && (
          <Card className="p-5 bg-gradient-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground">آخر الجلسات</h3>
              <button onClick={resetAll} className="text-xs text-destructive hover:underline">
                مسح الكل
              </button>
            </div>
            <ul className="space-y-2">
              {state.history.map((h, i) => (
                <li key={i} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                  <span className="font-quran text-foreground">{h.phrase}</span>
                  <span className="font-mono text-primary font-bold">{h.count}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </Layout>
  );
};

export default Tasbih;
