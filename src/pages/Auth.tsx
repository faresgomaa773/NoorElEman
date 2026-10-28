import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Sparkles, Mail, Lock, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

const signUpSchema = z.object({
  displayName: z.string().trim().min(2, "الاسم قصير جداً").max(50),
  email: z.string().trim().email("بريد غير صحيح").max(255),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("بريد غير صحيح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

const formatAuthError = (msg: string): string => {
  const lower = msg.toLowerCase();
  if (lower.includes("weak") || lower.includes("easy to guess") || lower.includes("pwned")) {
    return "كلمة المرور ضعيفة أو شائعة جداً، يرجى اختيار كلمة مرور أقوى تحتوي على حروف وأرقام.";
  }
  if (lower.includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "هذا البريد الإلكتروني مسجّل بالفعل.";
  }
  if (lower.includes("email not confirmed")) {
    return "يرجى تأكيد بريدك الإلكتروني أولاً.";
  }
  return msg;
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      displayName: fd.get("displayName"),
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast({ title: "خطأ", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: parsed.data.displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "تعذر إنشاء الحساب", description: formatAuthError(error.message), variant: "destructive" });
    } else {
      toast({ title: "تم إنشاء حسابك", description: "أهلاً بك في نور الإيمان" });
      navigate("/");
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      toast({ title: "خطأ", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast({ title: "تعذر تسجيل الدخول", description: formatAuthError(error.message), variant: "destructive" });
    } else {
      toast({ title: "مرحباً بعودتك" });
      navigate("/");
    }
  };

  return (
    <Layout>
      <SEO
        title="تسجيل الدخول أو إنشاء حساب | نور الإيمان"
        description="سجّل دخولك إلى نور الإيمان لحفظ نقاطك في الاختبارات الدينية ومتابعة تقدمك."
        keywords="تسجيل دخول, إنشاء حساب, نور الإيمان"
      />
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-emerald shadow-glow mb-4">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">تسجيل الدخول إلى نور الإيمان</h1>
            <p className="text-muted-foreground text-sm mt-2">سجّل دخولك لحفظ نقاطك ومتابعة تقدمك</p>
          </div>

          <div className="bg-gradient-card border border-border rounded-2xl p-6 shadow-medium">
            <Tabs defaultValue="signin">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">حساب جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email-in">البريد الإلكتروني</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email-in" name="email" type="email" required className="pr-10" placeholder="example@mail.com" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pass-in">كلمة المرور</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="pass-in" name="password" type="password" required className="pr-10" />
                    </div>
                  </div>
                  <Button type="submit" variant="emerald" size="lg" className="w-full" disabled={loading}>
                    {loading ? "..." : "دخول"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="name-up">الاسم</Label>
                    <div className="relative mt-1">
                      <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="name-up" name="displayName" required className="pr-10" placeholder="اسمك" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email-up">البريد الإلكتروني</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email-up" name="email" type="email" required className="pr-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pass-up">كلمة المرور</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="pass-up" name="password" type="password" required minLength={6} className="pr-10" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">6 أحرف على الأقل</p>
                  </div>
                  <Button type="submit" variant="emerald" size="lg" className="w-full" disabled={loading}>
                    {loading ? "..." : "إنشاء حساب"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            بإنشاء حسابك توافق على استخدام المنصة لخدمة دينية فقط
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
