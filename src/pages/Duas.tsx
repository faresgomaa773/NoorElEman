import { SEO } from "@/components/SEO";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookMarked } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_DUAS } from "@/data/islamicData";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";

interface Dua {
  id: string;
  title: string;
  text: string;
  category: string;
  source: string | null;
}

const Duas = () => {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("duas").select("*").order("display_order");
        if (!error && data && data.length > 0) {
          setDuas(data);
        } else {
          setDuas(DEFAULT_DUAS);
        }
      } catch {
        setDuas(DEFAULT_DUAS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = Array.from(new Set(duas.map((d) => d.category)));
  const filtered = filter === "all" ? duas : duas.filter((d) => d.category === filter);

  return (
    <Layout>
      <SEO
        title="الأدعية المأثورة | أدعية من القرآن والسنة | نور الإيمان"
        description="مجموعة شاملة من الأدعية المأثورة من القرآن الكريم والسنة النبوية لكل المناسبات."
        keywords="أدعية, دعاء, أدعية مأثورة, دعاء من القرآن, دعاء من السنة, نور الإيمان"
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 text-primary-foreground py-16">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <BookMarked className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">الأدعية المأثورة</h1>
          <p className="text-primary-foreground/85">من القرآن الكريم والسنة النبوية الصحيحة</p>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="sr-only">قائمة الأدعية</h2>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
              filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">لا توجد أدعية في هذا القسم حالياً.</div>
        ) : (
          <div className="grid gap-5 max-w-3xl mx-auto">
            {filtered.map((d, idx) => (
              <motion.article
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gradient-card rounded-2xl border border-border p-6 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="font-display text-xl font-bold text-primary">{d.title}</h3>
                  <Badge variant="secondary">{d.category}</Badge>
                </div>
                <p className="font-quran text-lg md:text-xl leading-loose text-foreground mb-4">{d.text}</p>
                {d.source && <p className="text-xs text-muted-foreground border-t border-border pt-3">{d.source}</p>}
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Duas;
