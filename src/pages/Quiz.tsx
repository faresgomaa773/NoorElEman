import { SEO } from "@/components/SEO";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Check, X, Sparkles, LogIn, BookOpen, Award, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_QUESTIONS } from "@/data/islamicData";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  points: number;
  category: string;
  explanation: string | null;
}

const Quiz = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>(() =>
    [...DEFAULT_QUESTIONS].slice(0, 10)
  );
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [revealedExplanation, setRevealedExplanation] = useState<string | null>(null);
  const [lastEarned, setLastEarned] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase.rpc("get_public_questions");
      if (!error && data && data.length > 0) {
        const shuffled = [...(data as Question[])].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffled);
      } else {
        const shuffled = [...DEFAULT_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffled);
      }
    } catch {
      const shuffled = [...DEFAULT_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const current = questions[idx];

  const handleSelect = async (opt: string) => {
    if (revealed || submitting || !current) return;
    setSelected(opt);
    setSubmitting(true);

    let result: {
      is_correct: boolean;
      points_earned: number;
      correct_answer: string;
      explanation: string | null;
    } | null = null;

    const fallbackQ = DEFAULT_QUESTIONS.find((q) => q.id === current.id);
    if (fallbackQ) {
      const isCorrect = fallbackQ.correct_answer.toLowerCase() === opt.toLowerCase();
      result = {
        is_correct: isCorrect,
        points_earned: isCorrect ? fallbackQ.points : 0,
        correct_answer: fallbackQ.correct_answer,
        explanation: fallbackQ.explanation,
      };
    } else {
      const { data, error } = await supabase.rpc("submit_quiz_answer", {
        _question_id: current.id,
        _selected_answer: opt,
      });

      if (!error && data && data.length > 0) {
        result = data[0] as {
          is_correct: boolean;
          points_earned: number;
          correct_answer: string;
          explanation: string | null;
        };
      }
    }

    if (!result) {
      toast({
        title: "حدث خطأ",
        description: "تعذر التحقق من الإجابة. حاول مرة أخرى.",
        variant: "destructive",
      });
      setSelected(null);
      setSubmitting(false);
      return;
    }

    setCorrectAnswer(result.correct_answer);
    setRevealedExplanation(result.explanation ?? current.explanation);
    setLastEarned(result.points_earned ?? 0);
    if (result.is_correct) {
      setScore((s) => s + (result.points_earned ?? 0));
      setCorrectCount((c) => c + 1);
      setStreak((st) => {
        const next = st + 1;
        setBestStreak((b) => Math.max(b, next));
        if (next === 3) toast({ title: "🔥 سلسلة رائعة!", description: "ثلاث إجابات صحيحة متتالية" });
        if (next === 5) toast({ title: "⚡ مذهل!", description: "خمس إجابات صحيحة متتالية" });
        return next;
      });
    } else {
      setStreak(0);
    }
    setRevealed(true);
    setSubmitting(false);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
      toast({ title: "أتممت الاختبار!", description: `حصلت على ${score} نقطة` });
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
      setCorrectAnswer(null);
      setRevealedExplanation(null);
      setLastEarned(0);
    }
  };

  const restart = () => {
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setCorrectAnswer(null);
    setRevealedExplanation(null);
    setLastEarned(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setDone(false);
    loadQuestions();
  };

  const options = current
    ? [
        { key: "a", label: current.option_a },
        { key: "b", label: current.option_b },
        { key: "c", label: current.option_c },
        { key: "d", label: current.option_d },
      ]
    : [];

  const totalPossible = questions.reduce((s, q) => s + q.points, 0);
  const accuracy = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
  const isCorrectSelection = revealed && selected !== null && selected === correctAnswer;

  return (
    <Layout>
      <SEO
        title="اختبارات دينية | اختبر معلوماتك الإسلامية | نور الإيمان"
        description="اختبارات دينية تفاعلية لاختبار معلوماتك في القرآن والسنة والفقه واجمع النقاط."
        keywords="اختبارات دينية, اختبار إسلامي, مسابقات دينية, نور الإيمان"
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-600 via-amber-600 to-orange-700 text-primary-foreground py-16">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">الاختبار الديني</h1>
          <p className="text-primary-foreground/85">اختبر معلوماتك واجمع النقاط لتتصدر القائمة</p>
        </div>
      </section>

      <section className="container py-12 max-w-2xl">
        {!user && (
          <div className="mb-6 bg-accent-soft border border-accent/30 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-foreground">
              <Sparkles className="inline h-4 w-4 text-accent ml-1" />
              سجّل دخولك لحفظ نقاطك في لوحة المتصدرين
            </p>
            <Button asChild size="sm" variant="gold">
              <Link to="/auth">
                <LogIn className="h-4 w-4" /> دخول
              </Link>
            </Button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-12">جاري تحضير الأسئلة...</div>
        ) : questions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">لا توجد أسئلة متاحة.</div>
        ) : done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-gradient-card border border-border rounded-2xl p-10 shadow-medium"
          >
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold shadow-gold mb-4">
              <Trophy className="h-10 w-10 text-accent-foreground" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-2">أحسنت!</h2>
            <p className="text-muted-foreground mb-6">حصلت على</p>
            <p className="font-display text-6xl font-bold text-primary mb-2">{score}</p>
            <p className="text-sm text-muted-foreground mb-4">نقطة من أصل {totalPossible}</p>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
              <div className="bg-accent-soft border border-accent/30 rounded-xl p-3">
                <Target className="h-4 w-4 text-accent mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">الدقة</p>
                <p className="font-display font-bold text-foreground">{accuracy}%</p>
              </div>
              <div className="bg-success/10 border border-success/30 rounded-xl p-3">
                <Check className="h-4 w-4 text-success mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">صحيحة</p>
                <p className="font-display font-bold text-foreground">{correctCount} / {questions.length}</p>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-3">
                <Sparkles className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">أطول سلسلة</p>
                <p className="font-display font-bold text-foreground">🔥 {bestStreak}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="emerald" size="lg" onClick={restart}>
                اختبار جديد
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/profile">حسابي ونقاطي</Link>
              </Button>
            </div>
          </motion.div>
        ) : current ? (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{current.category}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" /> {current.points} نقطة
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {streak >= 2 && (
                  <motion.span
                    key={streak}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1 bg-accent/20 border border-accent/30 rounded-full px-2.5 py-0.5 text-accent font-bold"
                  >
                    🔥 {streak}
                  </motion.span>
                )}
                <span>
                  سؤال {idx + 1} / {questions.length} •{" "}
                  <span className="text-accent font-bold">{score} نقطة</span>
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-8">
              <div
                className="h-full bg-gradient-gold transition-smooth"
                style={{ width: `${(idx / questions.length) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gradient-card border border-border rounded-2xl p-6 md:p-8 shadow-medium"
              >
                <h2 className="font-display text-xl md:text-2xl font-bold mb-6 leading-relaxed text-foreground">
                  {current.question_text}
                </h2>

                <div className="grid gap-3 mb-6">
                  {options.map((opt) => {
                    const isSelected = selected === opt.key;
                    const isCorrect = correctAnswer !== null && opt.key === correctAnswer;
                    let cls =
                      "border-border bg-card hover:border-primary/40 hover:bg-primary/5";
                    if (revealed) {
                      if (isCorrect)
                        cls = "border-success bg-success/10 text-foreground shadow-soft";
                      else if (isSelected)
                        cls = "border-destructive bg-destructive/10 text-foreground";
                      else cls = "border-border bg-card opacity-50";
                    } else if (isSelected) {
                      cls = "border-primary bg-primary/5";
                    }
                    return (
                      <motion.button
                        key={opt.key}
                        whileTap={{ scale: revealed ? 1 : 0.98 }}
                        onClick={() => handleSelect(opt.key)}
                        disabled={revealed || submitting}
                        className={`w-full text-right border-2 rounded-xl p-4 transition-smooth flex items-center justify-between gap-3 ${cls}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display font-bold text-sm ${
                              revealed && isCorrect
                                ? "bg-success text-success-foreground"
                                : revealed && isSelected
                                  ? "bg-destructive text-destructive-foreground"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {opt.key.toUpperCase()}
                          </span>
                          <span className="font-medium text-right flex-1">{opt.label}</span>
                        </div>
                        {revealed && isCorrect && (
                          <Check className="h-5 w-5 text-success shrink-0" />
                        )}
                        {revealed && isSelected && !isCorrect && (
                          <X className="h-5 w-5 text-destructive shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 mb-4"
                  >
                    <div
                      className={`rounded-xl p-4 border-2 flex items-start gap-3 ${
                        isCorrectSelection
                          ? "bg-success/10 border-success/30"
                          : "bg-destructive/10 border-destructive/30"
                      }`}
                    >
                      <div
                        className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full ${
                          isCorrectSelection ? "bg-success" : "bg-destructive"
                        }`}
                      >
                        {isCorrectSelection ? (
                          <Check className="h-5 w-5 text-success-foreground" />
                        ) : (
                          <X className="h-5 w-5 text-destructive-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-bold text-foreground mb-1">
                          {isCorrectSelection ? "إجابة صحيحة!" : "إجابة خاطئة"}
                        </p>
                        <p className="text-sm text-foreground/80">
                          {isCorrectSelection
                            ? `حصلت على ${lastEarned} نقطة`
                            : `الإجابة الصحيحة هي: ${correctAnswer?.toUpperCase()}`}
                        </p>
                      </div>
                    </div>

                    {revealedExplanation && (
                      <div className="bg-accent-soft border border-accent/30 rounded-xl p-4 flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <div className="text-sm text-foreground/90 leading-relaxed">
                          <span className="font-display font-semibold block mb-1 text-foreground">
                            الشرح
                          </span>
                          {revealedExplanation}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {revealed && (
                  <Button variant="emerald" size="lg" className="w-full" onClick={next}>
                    {idx + 1 >= questions.length ? "إنهاء الاختبار" : "السؤال التالي"}
                  </Button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}
      </section>
    </Layout>
  );
};

export default Quiz;
