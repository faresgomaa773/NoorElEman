import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Sparkles, Mail, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { markUserAsRegularSignup } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

const signUpSchema = z.object({
  displayName: z.string().trim().min(2, "الاسم قصير جداً (حرفان على الأقل)").max(50, "الاسم طويل جداً"),
  email: z.string().trim().email("يرجى إدخال بريد إلكتروني صحيح").max(255),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z.string().min(1, "يرجى إدخال كلمة المرور"),
});

const formatAuthError = (msg: string): string => {
  const lower = msg.toLowerCase();
  if (lower.includes("weak") || lower.includes("easy to guess") || lower.includes("pwned")) {
    return "كلمة المرور ضعيفة أو شائعة جداً، يرجى اختيار كلمة مرور أقوى تحتوي على حروف وأرقام.";
  }
  if (lower.includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (lower.includes("already registered") || lower.includes("already exists") || lower.includes("مسجّل بالفعل")) {
    return "هذا البريد الإلكتروني مسجّل بالفعل، يمكنك تسجيل الدخول مباشرة.";
  }
  if (lower.includes("email not confirmed")) {
    return "يرجى تأكيد بريدك الإلكتروني أو إعادة المحاولة.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "تم إرسال طلبات كثيرة، يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.";
  }
  return msg;
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [showSignInPass, setShowSignInPass] = useState(false);
  const [showSignUpPass, setShowSignUpPass] = useState(false);
  const [sharedEmail, setSharedEmail] = useState("");

  const notifyAuthChanged = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("al-noor-auth-sync"));
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rawName = String(fd.get("displayName") ?? "");
    const rawEmail = String(fd.get("email") ?? "").trim().toLowerCase();
    const rawPassword = String(fd.get("password") ?? "");

    const parsed = signUpSchema.safeParse({
      displayName: rawName,
      email: rawEmail,
      password: rawPassword,
    });
    if (!parsed.success) {
      toast({ title: "بيانات غير مكتملة", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: parsed.data.displayName, role: "user" },
      },
    });

    if (error) {
      setLoading(false);
      const formatted = formatAuthError(error.message);
      toast({ title: "تعذر إنشاء الحساب", description: formatted, variant: "destructive" });
      if (
        error.message.toLowerCase().includes("already") ||
        error.message.includes("مسجّل بالفعل")
      ) {
        setSharedEmail(parsed.data.email);
        setActiveTab("signin");
      }
      return;
    }

    if (data?.user) {
      markUserAsRegularSignup(data.user.id, data.user.email);
    }

    // Ensure session is active immediately after signup
    if (!data?.session) {
      const signInRes = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signInRes.data?.user) {
        markUserAsRegularSignup(signInRes.data.user.id, signInRes.data.user.email);
      }
    }

    setLoading(false);
    notifyAuthChanged();
    toast({
      title: "تم إنشاء حسابك بنجاح",
      description: `أهلاً بك يا ${parsed.data.displayName} في نور الإيمان`,
    });
    navigate("/");
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rawEmail = String(fd.get("email") ?? "").trim().toLowerCase();
    const rawPassword = String(fd.get("password") ?? "");

    const parsed = signInSchema.safeParse({ email: rawEmail, password: rawPassword });
    if (!parsed.success) {
      toast({ title: "بيانات غير مكتملة", description: parsed.error.issues[0].message, variant: "destructive" });
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
      notifyAuthChanged();
      toast({ title: "مرحباً بعودتك", description: "تم تسجيل دخولك بنجاح" });
      navigate("/");
    }
  };

  return (
    <Layout>
      <SEO
        title="تسجيل الدخول أو إنشاء حساب | نور الإيمان"
        description="سجّل دخولك إلى نور الإيمان لحفظ نقاطك في الاختبارات الدينية ومتابعة تقدمك."
        keywords="تسجيل دخول, إنشاء حساب, نور الإيمان"
        noindex
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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "signin" | "signup")}>
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
                      <Input
                        id="email-in"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        defaultValue={sharedEmail}
                        onChange={(e) => setSharedEmail(e.target.value)}
                        className="pr-10"
                        placeholder="example@mail.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pass-in">كلمة المرور</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pass-in"
                        name="password"
                        type={showSignInPass ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        className="pr-10 pl-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPass((v) => !v)}
                        aria-label={showSignInPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSignInPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" variant="emerald" size="lg" className="w-full" disabled={loading}>
                    {loading ? "جاري الدخول..." : "دخول"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="name-up">الاسم</Label>
                    <div className="relative mt-1">
                      <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name-up"
                        name="displayName"
                        required
                        autoComplete="name"
                        className="pr-10"
                        placeholder="اسمك الكريم"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email-up">البريد الإلكتروني</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-up"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        defaultValue={sharedEmail}
                        onChange={(e) => setSharedEmail(e.target.value)}
                        className="pr-10"
                        placeholder="example@mail.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pass-up">كلمة المرور</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pass-up"
                        name="password"
                        type={showSignUpPass ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="pr-10 pl-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPass((v) => !v)}
                        aria-label={showSignUpPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSignUpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">6 أحرف على الأقل</p>
                  </div>
                  <Button type="submit" variant="emerald" size="lg" className="w-full" disabled={loading}>
                    {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
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
