import { SEO } from "@/components/SEO";
import { HOME_FAQS } from "@/lib/site";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, BookMarked, BookOpen, Trophy, Sparkles, ArrowLeft, Calendar, CircleDot, Heart, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { DailyDhikrCard } from "@/components/DailyDhikrCard";
import { PrayerTimesHero } from "@/components/PrayerTimesHero";
import { SmartLink } from "@/components/SmartLink";

const features = [
  { to: "/morning", title: "أذكار الصباح", desc: "احفظ يومك بأذكار الصباح المباركة", icon: Sun, color: "from-amber-400 to-orange-500" },
  { to: "/evening", title: "أذكار المساء", desc: "اختم يومك بذكر الله والاستغفار", icon: Moon, color: "from-indigo-500 to-purple-600" },
  { to: "/duas", title: "الأدعية المأثورة", desc: "أدعية من القرآن والسنة لكل المناسبات", icon: BookMarked, color: "from-emerald-500 to-teal-600" },
  { to: "/favorites", title: "مفضلتك", desc: "الأذكار والأدعية التي حفظتها للرجوع السريع", icon: Heart, color: "from-rose-500 to-red-600" },
  { to: "/tasbih", title: "السبحة الإلكترونية", desc: "سبّح وتابع عددك التراكمي", icon: CircleDot, color: "from-amber-500 to-rose-600" },
  { to: "/quran", title: "القرآن الكريم", desc: "القرآن كاملاً بالرسم العثماني", icon: BookOpen, color: "from-rose-500 to-pink-600" },
  { to: "/quiz", title: "الاختبارات الدينية", desc: "اختبر معلوماتك واجمع النقاط", icon: Trophy, color: "from-yellow-500 to-amber-600" },
  { to: "/profile", title: "حسابي ونقاطي", desc: "تابع تقدمك ونقاطك في الاختبارات", icon: Sparkles, color: "from-cyan-500 to-blue-600" },
];

const dailyVerses = [
  { text: "﴿ الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾", ref: "سورة الرعد - آية 28" },
  { text: "﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ﴾", ref: "سورة الطلاق - 2-3" },
  { text: "﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾", ref: "سورة الشرح - آية 6" },
  { text: "﴿ وَبَشِّرِ الصَّابِرِينَ ﴾", ref: "سورة البقرة - آية 155" },
  { text: "﴿ وَاذْكُر رَّبَّكَ كَثِيرًا وَسَبِّحْ بِالْعَشِيِّ وَالْإِبْكَارِ ﴾", ref: "سورة آل عمران - آية 41" },
  { text: "﴿ فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ ﴾", ref: "سورة البقرة - آية 152" },
  { text: "﴿ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ﴾", ref: "سورة الطلاق - آية 3" },
  { text: "﴿ ادْعُونِي أَسْتَجِبْ لَكُمْ ﴾", ref: "سورة غافر - آية 60" },
  { text: "﴿ وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ﴾", ref: "سورة البقرة - آية 186" },
  { text: "﴿ قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ﴾", ref: "سورة الزمر - آية 53" },
  { text: "﴿ وَاللَّهُ خَيْرُ الرَّازِقِينَ ﴾", ref: "سورة الجمعة - آية 11" },
  { text: "﴿ حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ ﴾", ref: "سورة آل عمران - آية 173" },
  { text: "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾", ref: "سورة طه - آية 114" },
  { text: "﴿ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ﴾", ref: "سورة البقرة - آية 153" },
  { text: "﴿ وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ۖ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ ﴾", ref: "سورة يوسف - آية 87" },
  { text: "﴿ وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ ﴾", ref: "سورة البقرة - آية 216" },
  { text: "﴿ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ ﴾", ref: "سورة البقرة - آية 195" },
  { text: "﴿ وَاللَّهُ يُحِبُّ الصَّابِرِينَ ﴾", ref: "سورة آل عمران - آية 146" },
  { text: "﴿ وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ وَسَبِّحْ بِحَمْدِهِ ﴾", ref: "سورة الفرقان - آية 58" },
  { text: "﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾", ref: "سورة الشرح - 5-6" },
  { text: "﴿ وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ ﴾", ref: "سورة هود - آية 88" },
  { text: "﴿ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ ﴾", ref: "سورة البقرة - آية 201" },
  { text: "﴿ وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ ﴾", ref: "سورة النجم - آية 39" },
  { text: "﴿ إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ سَيَجْعَلُ لَهُمُ الرَّحْمَٰنُ وُدًّا ﴾", ref: "سورة مريم - آية 96" },
  { text: "﴿ وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ ﴾", ref: "سورة آل عمران - آية 133" },
  { text: "﴿ وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ۚ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ ﴾", ref: "سورة الحديد - آية 4" },
  { text: "﴿ إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَن يَقُولَ لَهُ كُن فَيَكُونُ ﴾", ref: "سورة يس - آية 82" },
  { text: "﴿ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ﴾", ref: "سورة الزلزلة - آية 7" },
  { text: "﴿ وَبَشِّرِ الَّذِينَ آمَنُوا أَنَّ لَهُمْ قَدَمَ صِدْقٍ عِندَ رَبِّهِمْ ﴾", ref: "سورة يونس - آية 2" },
  { text: "﴿ كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ ۗ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ الْقِيَامَةِ ﴾", ref: "سورة آل عمران - آية 185" },
];

// يتغيّر بشكل يومي اعتماداً على تاريخ اليوم الكامل
const getDailyVerse = () => {
  const today = new Date();
  const seed = today.getFullYear() * 372 + (today.getMonth() + 1) * 31 + today.getDate();
  return dailyVerses[seed % dailyVerses.length];
};

const Index = () => {
  const verse = getDailyVerse();
  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <Layout>
      <SEO faqs={HOME_FAQS} />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative py-24 md:py-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/30 px-4 py-1.5 text-sm text-accent mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              منصة دينية متكاملة
            </div>
            <h1 className="font-display text-primary-foreground mb-6">
              نور الإيمان — أذكار وأدعية والقرآن الكريم
              <span className="block text-accent text-xl md:text-2xl mt-4 font-normal font-quran">
                ﴿ وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ ﴾
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-primary-foreground/85 mb-12 leading-relaxed">
              أذكار الصباح والمساء، الأدعية المأثورة، القرآن الكريم، واختبارات دينية تفاعلية لتعزيز ارتباطك بدينك.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/morning">
                  ابدأ بالأذكار <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                <Link to="/quiz">
                  جرّب الاختبار
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Prayer Times — full-width hero widget */}
      <section className="container pt-16 pb-6">
        <PrayerTimesHero />
      </section>

      {/* Daily Dhikr */}
      <section className="container py-6">
        <DailyDhikrCard />
      </section>

      {/* Features */}
      <section className="container py-20">
        <header className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-foreground mb-4">
            استكشف أقسام الموقع
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            كل ما تحتاجه في رحلتك الإيمانية، في مكان واحد منظّم وأنيق.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.to}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
              >
                <SmartLink
                  to={feature.to}
                  className="group block h-full bg-gradient-card rounded-2xl p-7 border border-border hover:border-primary/30 shadow-soft hover:shadow-medium transition-smooth"
                >
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-6 shadow-medium group-hover:scale-110 transition-spring`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-foreground group-hover:text-primary transition-smooth">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {feature.desc}
                  </p>
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    اكتشف
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-smooth" />
                  </div>
                </SmartLink>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Daily verse banner */}
      <section className="container pb-16">
        <motion.div
          key={verse.ref}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-gradient-emerald p-12 md:p-20 text-center text-primary-foreground overflow-hidden shadow-glow"
        >
          <div className="absolute inset-0 pattern-arabesque opacity-20" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/30 px-4 py-1.5 text-xs text-accent mb-6">
              <Calendar className="h-3.5 w-3.5" />
              آية اليوم • {today}
            </div>
            <p className="font-quran text-2xl md:text-4xl leading-loose mb-6">
              {verse.text}
            </p>
            <p className="text-accent font-display text-sm md:text-base">{verse.ref}</p>
          </div>
        </motion.div>
      </section>

      {/* Semantic FAQ section matching FAQPage structured data */}
      <section className="container pb-24" aria-labelledby="home-faq-heading">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-2">
              <HelpCircle className="h-4 w-4" />
              <span>معلومات إسلامية تهمّك</span>
            </div>
            <h2 id="home-faq-heading" className="text-foreground text-2xl md:text-3xl font-bold">
              أسئلة شائعة حول الأذكار والأدعية والقرآن الكريم
            </h2>
          </header>
          <div className="grid gap-4">
            {HOME_FAQS.map((faq) => (
              <article
                key={faq.question}
                className="bg-gradient-card border border-border rounded-2xl p-6 shadow-soft"
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

