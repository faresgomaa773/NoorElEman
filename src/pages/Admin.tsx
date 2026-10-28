import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Shield, Users, BookMarked, Sun, HelpCircle, Plus, Trash2, Edit, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import type { Database } from "@/integrations/supabase/types";

type ZikrCat = Database["public"]["Enums"]["zikr_category"];
type ZikrRow = Database["public"]["Tables"]["azkar"]["Row"];
type DuaRow = Database["public"]["Tables"]["duas"]["Row"];
type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({ users: 0, azkar: 0, duas: 0, questions: 0, totalPoints: 0 });

  const [azkar, setAzkar] = useState<ZikrRow[]>([]);
  const [duas, setDuas] = useState<DuaRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  const refresh = async () => {
    const [a, d, q, p] = await Promise.all([
      supabase.from("azkar").select("*").order("display_order"),
      supabase.from("duas").select("*").order("display_order"),
      supabase.rpc("admin_get_questions"),
      supabase.from("profiles").select("*").order("total_points", { ascending: false }),
    ]);
    if (a.data) setAzkar(a.data);
    if (d.data) setDuas(d.data);
    if (q.data) setQuestions(q.data);
    if (p.data) {
      setProfiles(p.data);
      setStats({
        users: p.data.length,
        azkar: a.data?.length ?? 0,
        duas: d.data?.length ?? 0,
        questions: q.data?.length ?? 0,
        totalPoints: p.data.reduce((s, x) => s + (x.total_points ?? 0), 0),
      });
    }
  };

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  if (authLoading) return (
    <Layout>
      <SEO title="لوحة التحكم | نور الإيمان" description="إدارة المحتوى والمستخدمين والأسئلة في منصة نور الإيمان." />
      <div className="container py-20 text-center text-muted-foreground">جاري التحقق...</div>
    </Layout>
  );
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return (
    <Layout>
      <SEO title="لوحة التحكم | نور الإيمان" description="إدارة المحتوى والمستخدمين والأسئلة في منصة نور الإيمان." />
      <div className="container py-20 text-center">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">وصول مرفوض</h2>
        <p className="text-muted-foreground mb-6">هذه الصفحة للمدراء فقط.</p>
        <Button asChild variant="emerald"><Link to="/">العودة للرئيسية</Link></Button>
      </div>
    </Layout>
  );

  // ---- Azkar handlers
  const saveZikr = async (e: React.FormEvent<HTMLFormElement>, id?: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      text: String(fd.get("text") ?? ""),
      category: String(fd.get("category") ?? "general") as ZikrCat,
      repeat_count: Number(fd.get("repeat_count") ?? 1),
      virtue: String(fd.get("virtue") ?? "") || null,
      source: String(fd.get("source") ?? "") || null,
      display_order: Number(fd.get("display_order") ?? 0),
    };
    const res = id
      ? await supabase.from("azkar").update(payload).eq("id", id)
      : await supabase.from("azkar").insert(payload);
    if (res.error) toast({ title: "خطأ", description: res.error.message, variant: "destructive" });
    else { toast({ title: "تم الحفظ" }); refresh(); }
  };
  const deleteZikr = async (id: string) => {
    await supabase.from("azkar").delete().eq("id", id);
    toast({ title: "تم الحذف" }); refresh();
  };

  // ---- Duas handlers
  const saveDua = async (e: React.FormEvent<HTMLFormElement>, id?: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") ?? ""),
      text: String(fd.get("text") ?? ""),
      category: String(fd.get("category") ?? "عام"),
      source: String(fd.get("source") ?? "") || null,
      display_order: Number(fd.get("display_order") ?? 0),
    };
    const res = id
      ? await supabase.from("duas").update(payload).eq("id", id)
      : await supabase.from("duas").insert(payload);
    if (res.error) toast({ title: "خطأ", description: res.error.message, variant: "destructive" });
    else { toast({ title: "تم الحفظ" }); refresh(); }
  };
  const deleteDua = async (id: string) => {
    await supabase.from("duas").delete().eq("id", id);
    toast({ title: "تم الحذف" }); refresh();
  };

  // ---- Questions handlers
  const saveQuestion = async (e: React.FormEvent<HTMLFormElement>, id?: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      question_text: String(fd.get("question_text") ?? ""),
      option_a: String(fd.get("option_a") ?? ""),
      option_b: String(fd.get("option_b") ?? ""),
      option_c: String(fd.get("option_c") ?? ""),
      option_d: String(fd.get("option_d") ?? ""),
      correct_answer: String(fd.get("correct_answer") ?? "a"),
      points: Number(fd.get("points") ?? 10),
      category: String(fd.get("category") ?? "عام"),
      explanation: String(fd.get("explanation") ?? "") || null,
    };
    const res = id
      ? await supabase.from("questions").update(payload).eq("id", id)
      : await supabase.from("questions").insert(payload);
    if (res.error) toast({ title: "خطأ", description: res.error.message, variant: "destructive" });
    else { toast({ title: "تم الحفظ" }); refresh(); }
  };
  const deleteQuestion = async (id: string) => {
    await supabase.from("questions").delete().eq("id", id);
    toast({ title: "تم الحذف" }); refresh();
  };

  // ---- Users
  const deleteUser = async (id: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else { toast({ title: "تم الحذف" }); refresh(); }
  };
  const toggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    } else {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    }
    toast({ title: makeAdmin ? "تم منح صلاحية المدير" : "تم سحب صلاحية المدير" });
  };

  return (
    <Layout>
      <SEO
        title="لوحة التحكم | نور الإيمان"
        description="إدارة المحتوى والمستخدمين والأسئلة في منصة نور الإيمان."
      />
      <section className="bg-gradient-emerald text-primary-foreground py-10">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-7 w-7 text-accent" />
            <h1 className="font-display text-3xl md:text-4xl font-bold">لوحة التحكم</h1>
          </div>
          <p className="text-primary-foreground/85">إدارة المستخدمين والمحتوى والأسئلة</p>
        </div>
      </section>

      <section className="container py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {[
            { label: "المستخدمون", value: stats.users, icon: Users },
            { label: "الأذكار", value: stats.azkar, icon: Sun },
            { label: "الأدعية", value: stats.duas, icon: BookMarked },
            { label: "الأسئلة", value: stats.questions, icon: HelpCircle },
            { label: "إجمالي النقاط", value: stats.totalPoints, icon: BarChart3 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-gradient-card border border-border rounded-2xl p-4 shadow-soft">
                <Icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            );
          })}
        </div>

        <Tabs defaultValue="azkar">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="azkar">الأذكار</TabsTrigger>
            <TabsTrigger value="duas">الأدعية</TabsTrigger>
            <TabsTrigger value="questions">الأسئلة</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
          </TabsList>

          {/* AZKAR */}
          <TabsContent value="azkar">
            <Tabs defaultValue="morning">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="morning">أذكار الصباح</TabsTrigger>
                <TabsTrigger value="evening">أذكار المساء</TabsTrigger>
                <TabsTrigger value="other">أخرى</TabsTrigger>
              </TabsList>

              {([
                { key: "morning", label: "ذكر صباح", cats: ["morning"] as ZikrCat[] },
                { key: "evening", label: "ذكر مساء", cats: ["evening"] as ZikrCat[] },
                { key: "other", label: "ذكر", cats: ["awrad", "sleep", "general"] as ZikrCat[] },
              ]).map((group) => {
                const items = azkar.filter((z) => group.cats.includes(z.category));
                const lockedCategory = group.cats.length === 1 ? group.cats[0] : undefined;
                return (
                  <TabsContent key={group.key} value={group.key}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">{items.length} عنصر</p>
                      <ZikrDialog onSave={saveZikr} lockedCategory={lockedCategory} triggerLabel={`إضافة ${group.label}`} />
                    </div>
                    <div className="space-y-2">
                      {items.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8 text-sm">لا توجد عناصر.</div>
                      ) : items.map((z) => (
                        <div key={z.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-quran text-foreground line-clamp-2 mb-1">{z.text}</p>
                            <p className="text-xs text-muted-foreground">{z.category} • تكرار {z.repeat_count}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <ZikrDialog item={z} onSave={(e) => saveZikr(e, z.id)} lockedCategory={lockedCategory} />
                            <Button size="icon" variant="ghost" onClick={() => deleteZikr(z.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </TabsContent>

          {/* DUAS */}
          <TabsContent value="duas">
            <div className="flex justify-end mb-4">
              <DuaDialog onSave={saveDua} />
            </div>
            <div className="space-y-2">
              {duas.map((d) => (
                <div key={d.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-primary mb-1">{d.title}</p>
                    <p className="font-quran text-sm text-foreground/80 line-clamp-2">{d.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{d.category}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <DuaDialog item={d} onSave={(e) => saveDua(e, d.id)} />
                    <Button size="icon" variant="ghost" onClick={() => deleteDua(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* QUESTIONS */}
          <TabsContent value="questions">
            <div className="flex justify-end mb-4">
              <QuestionDialog onSave={saveQuestion} />
            </div>
            <div className="space-y-2">
              {questions.map((q) => (
                <div key={q.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-foreground mb-1 line-clamp-2">{q.question_text}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.category} • {q.points} نقطة • الإجابة: <span className="text-success font-bold uppercase">{q.correct_answer}</span>
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <QuestionDialog item={q} onSave={(e) => saveQuestion(e, q.id)} />
                    <Button size="icon" variant="ghost" onClick={() => deleteQuestion(q.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <div className="space-y-2">
              {profiles.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-medium text-foreground">{p.display_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.id.slice(0, 8)}…</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-primary">{p.total_points} نقطة</span>
                    <UserAdminToggle userId={p.id} onToggle={toggleAdmin} />
                    <Button size="icon" variant="ghost" onClick={() => deleteUser(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </Layout>
  );
};

// ---------- Dialogs ----------

function ZikrDialog({ item, onSave, lockedCategory, triggerLabel }: { item?: ZikrRow; onSave: (e: React.FormEvent<HTMLFormElement>) => void; lockedCategory?: ZikrCat; triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  const defaultCat = item?.category ?? lockedCategory ?? "general";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {item ? (
          <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button variant="emerald"><Plus className="h-4 w-4" /> {triggerLabel ?? "إضافة ذكر"}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{item ? "تعديل ذكر" : "ذكر جديد"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { onSave(e); setOpen(false); }} className="space-y-3">
          <div>
            <Label>النص</Label>
            <Textarea name="text" defaultValue={item?.text} required rows={4} className="font-quran" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>الفئة</Label>
              {lockedCategory && !item ? (
                <>
                  <input type="hidden" name="category" value={lockedCategory} />
                  <div className="w-full h-10 rounded-md border border-input bg-muted/40 px-3 text-sm flex items-center text-muted-foreground">
                    {lockedCategory === "morning" ? "أذكار الصباح" : lockedCategory === "evening" ? "أذكار المساء" : lockedCategory}
                  </div>
                </>
              ) : (
                <select name="category" defaultValue={defaultCat} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="morning">أذكار الصباح</option>
                  <option value="evening">أذكار المساء</option>
                  <option value="awrad">أوراد</option>
                  <option value="sleep">أذكار النوم</option>
                  <option value="general">عام</option>
                </select>
              )}
            </div>
            <div>
              <Label>عدد التكرار</Label>
              <Input name="repeat_count" type="number" defaultValue={item?.repeat_count ?? 1} min={1} />
            </div>
          </div>
          <div>
            <Label>الفضل (اختياري)</Label>
            <Input name="virtue" defaultValue={item?.virtue ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>المصدر</Label>
              <Input name="source" defaultValue={item?.source ?? ""} />
            </div>
            <div>
              <Label>الترتيب</Label>
              <Input name="display_order" type="number" defaultValue={item?.display_order ?? 0} />
            </div>
          </div>
          <DialogFooter><Button type="submit" variant="emerald">حفظ</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DuaDialog({ item, onSave }: { item?: DuaRow; onSave: (e: React.FormEvent<HTMLFormElement>) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {item ? (
          <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button variant="emerald"><Plus className="h-4 w-4" /> إضافة دعاء</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{item ? "تعديل دعاء" : "دعاء جديد"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { onSave(e); setOpen(false); }} className="space-y-3">
          <div><Label>العنوان</Label><Input name="title" defaultValue={item?.title} required /></div>
          <div><Label>النص</Label><Textarea name="text" defaultValue={item?.text} required rows={4} className="font-quran" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>الفئة</Label><Input name="category" defaultValue={item?.category ?? "عام"} /></div>
            <div><Label>المصدر</Label><Input name="source" defaultValue={item?.source ?? ""} /></div>
          </div>
          <div><Label>الترتيب</Label><Input name="display_order" type="number" defaultValue={item?.display_order ?? 0} /></div>
          <DialogFooter><Button type="submit" variant="emerald">حفظ</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuestionDialog({ item, onSave }: { item?: QuestionRow; onSave: (e: React.FormEvent<HTMLFormElement>) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {item ? (
          <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button variant="emerald"><Plus className="h-4 w-4" /> إضافة سؤال</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? "تعديل سؤال" : "سؤال جديد"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { onSave(e); setOpen(false); }} className="space-y-3">
          <div><Label>السؤال</Label><Textarea name="question_text" defaultValue={item?.question_text} required rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>الخيار أ</Label><Input name="option_a" defaultValue={item?.option_a} required /></div>
            <div><Label>الخيار ب</Label><Input name="option_b" defaultValue={item?.option_b} required /></div>
            <div><Label>الخيار ج</Label><Input name="option_c" defaultValue={item?.option_c} required /></div>
            <div><Label>الخيار د</Label><Input name="option_d" defaultValue={item?.option_d} required /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>الإجابة</Label>
              <select name="correct_answer" defaultValue={item?.correct_answer ?? "a"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="a">أ</option><option value="b">ب</option><option value="c">ج</option><option value="d">د</option>
              </select>
            </div>
            <div><Label>النقاط</Label><Input name="points" type="number" defaultValue={item?.points ?? 10} /></div>
            <div><Label>الفئة</Label><Input name="category" defaultValue={item?.category ?? "عام"} /></div>
          </div>
          <div><Label>الشرح (اختياري)</Label><Textarea name="explanation" defaultValue={item?.explanation ?? ""} rows={2} /></div>
          <DialogFooter><Button type="submit" variant="emerald">حفظ</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UserAdminToggle({ userId, onToggle }: { userId: string; onToggle: (id: string, makeAdmin: boolean) => void }) {
  const [isAdminUser, setIsAdminUser] = useState(false);
  useEffect(() => {
    supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdminUser(!!data));
  }, [userId]);
  return (
    <Button
      size="sm"
      variant={isAdminUser ? "gold" : "outline"}
      onClick={() => { onToggle(userId, !isAdminUser); setIsAdminUser(!isAdminUser); }}
    >
      <Shield className="h-3 w-3" />
      {isAdminUser ? "مدير" : "ترقية"}
    </Button>
  );
}

export default Admin;
