import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Target, CheckCircle2, XCircle, Award, User as UserIcon, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface ProfileData {
  display_name: string;
  total_points: number;
}

interface Stats {
  total: number;
  correct: number;
  wrong: number;
}

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, wrong: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const [{ data: profileData }, { data: attempts }] = await Promise.all([
        supabase.from("profiles").select("display_name, total_points").eq("id", user.id).maybeSingle(),
        supabase.from("quiz_attempts").select("is_correct").eq("user_id", user.id),
      ]);

      if (profileData) setProfile(profileData);
      if (attempts) {
        const correct = attempts.filter((a) => a.is_correct).length;
        setStats({ total: attempts.length, correct, wrong: attempts.length - correct });
      }
      setLoading(false);
    };

    load();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <Layout>
        <SEO
          title="حسابي ونقاطي | نور الإيمان"
          description="تتبّع نقاطك ودقّة إجاباتك في الاختبارات الدينية على نور الإيمان."
          keywords="حساب, نقاط, إحصائيات, اختبارات دينية, نور الإيمان"
        />
        <div className="container py-20 text-center text-muted-foreground">جارٍ التحميل...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <SEO
          title="حسابي ونقاطي | نور الإيمان"
          description="تتبّع نقاطك ودقّة إجاباتك في الاختبارات الدينية على نور الإيمان."
          keywords="حساب, نقاط, إحصائيات, اختبارات دينية, نور الإيمان"
        />
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center bg-gradient-card border border-border rounded-2xl p-10 shadow-medium">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-emerald shadow-glow mb-5">
              <UserIcon className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-3">سجّل دخولك أولاً</h1>
            <p className="text-muted-foreground mb-6">سجّل دخولك لعرض نقاطك ومتابعة تقدمك في الاختبارات.</p>
            <Button asChild variant="emerald" size="lg" className="w-full">
              <Link to="/auth"><LogIn className="h-4 w-4" /> دخول / إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <Layout>
      <SEO
        title="حسابي ونقاطي | نور الإيمان"
        description="تتبّع نقاطك ودقّة إجاباتك في الاختبارات الدينية على نور الإيمان."
        keywords="حساب, نقاط, إحصائيات, اختبارات دينية, نور الإيمان"
      />
      <div className="container py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-emerald rounded-3xl p-8 md:p-10 text-primary-foreground shadow-glow mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 pattern-arabesque opacity-20" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-accent" />
            </div>
            <div className="text-center md:text-right flex-1">
              <p className="text-primary-foreground/80 text-sm">أهلاً بك،</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{profile?.display_name || "مستخدم"}</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">{user.email}</p>
            </div>
            <div className="text-center bg-accent/20 border border-accent/30 rounded-2xl px-6 py-4">
              <Trophy className="h-6 w-6 text-accent mx-auto mb-1" />
              <div className="font-display text-3xl font-bold text-accent">{profile?.total_points ?? 0}</div>
              <div className="text-xs text-primary-foreground/80">نقطة</div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: "إجمالي النقاط", value: profile?.total_points ?? 0, icon: Trophy, color: "text-accent" },
            { label: "محاولات", value: stats.total, icon: Target, color: "text-primary" },
            { label: "إجابات صحيحة", value: stats.correct, icon: CheckCircle2, color: "text-success" },
            { label: "إجابات خاطئة", value: stats.wrong, icon: XCircle, color: "text-destructive" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-gradient-card border border-border rounded-2xl p-5 shadow-soft"
              >
                <Icon className={`h-6 w-6 ${stat.color} mb-3`} />
                <div className="font-display text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-card border border-border rounded-2xl p-6 shadow-soft mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                <h2 className="font-display text-lg font-bold">نسبة الدقة</h2>
              </div>
              <span className="font-display text-2xl font-bold text-primary">{accuracy}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-emerald"
              />
            </div>
          </motion.div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild variant="emerald" size="lg">
            <Link to="/quiz"><Trophy className="h-4 w-4" /> ابدأ اختبار جديد</Link>
          </Button>
          <Button variant="outline" size="lg" onClick={signOut}>تسجيل خروج</Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
