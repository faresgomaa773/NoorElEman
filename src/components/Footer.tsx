import { Link } from "react-router-dom";
import { Sparkles, Heart } from "lucide-react";

const publicLinks = [
  { to: "/morning", label: "أذكار الصباح" },
  { to: "/evening", label: "أذكار المساء" },
  { to: "/duas", label: "الأدعية المأثورة" },
  { to: "/quran", label: "القرآن الكريم" },
  { to: "/tasbih", label: "السبحة الإلكترونية" },
  { to: "/quiz", label: "الاختبارات الدينية" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-20">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-3 text-center md:text-right">
          <div>
            <Link
              to="/"
              className="inline-flex items-center justify-center md:justify-start gap-2 mb-3 font-display text-lg font-bold text-primary hover:opacity-90 transition-opacity"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-emerald">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              نور الإيمان
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة شاملة للأذكار والأدعية والقرآن الكريم، نسأل الله أن يجعلها في موازين حسناتنا.
            </p>
          </div>
          <nav aria-label="روابط أقسام الموقع">
            <h3 className="font-display font-semibold mb-3">أقسام الموقع</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {publicLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="font-display font-semibold mb-3">دعاء</h3>
            <p className="text-sm text-muted-foreground font-quran leading-loose">
              "اللَّهُمَّ تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ"
            </p>
          </div>
        </div>
        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            صُنع بـ <Heart className="h-3 w-3 text-accent fill-accent" /> لخدمة الإسلام والمسلمين
          </div>
          <div className="flex items-center gap-1 text-primary/70">
            <span>©</span>
            <span>{new Date().getFullYear()}</span>
            <span>نور الإيمان. جميع الحقوق محفوظة.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
