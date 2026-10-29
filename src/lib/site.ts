export const SITE_URL = "https://al-noor-quest.lovable.app";

export const PUBLIC_PATHS = ["/", "/morning", "/evening", "/duas", "/quran", "/tasbih", "/quiz"];

export interface RouteSeoMeta {
  path: string;
  title: string;
  description: string;
  keywords: string;
  heading: string;
}

export const ROUTE_SEO_META: Record<string, RouteSeoMeta> = {
  "/": {
    path: "/",
    title: "نور الإيمان | أذكار الصباح والمساء والأدعية والقرآن الكريم",
    description:
      "منصة نور الإيمان الإسلامية المتكاملة: أذكار الصباح والمساء من حصن المسلم، الأدعية المأثورة، القرآن الكريم بالرسم العثماني مع التلاوة، مواقيت الصلاة، والسبحة الإلكترونية.",
    keywords:
      "نور الإيمان, أذكار الصباح, أذكار المساء, أدعية مأثورة, القرآن الكريم, مواقيت الصلاة, حصن المسلم, السبحة الإلكترونية, اختبارات دينية",
    heading: "نور الإيمان — منصة الأذكار والأدعية والقرآن الكريم",
  },
  "/morning": {
    path: "/morning",
    title: "أذكار الصباح مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "أذكار الصباح المباركة مكتوبة كاملة من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وفضل كل ذكر.",
    keywords:
      "أذكار الصباح, اذكار الصباح مكتوبة, دعاء الصباح, حصن المسلم أذكار الصباح, نور الإيمان",
    heading: "أذكار الصباح",
  },
  "/evening": {
    path: "/evening",
    title: "أذكار المساء مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "أذكار المساء المباركة مكتوبة كاملة من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وفضل كل ذكر.",
    keywords:
      "أذكار المساء, اذكار المساء مكتوبة, دعاء المساء, حصن المسلم أذكار المساء, نور الإيمان",
    heading: "أذكار المساء",
  },
  "/duas": {
    path: "/duas",
    title: "الأدعية المأثورة من القرآن والسنة النبوية | نور الإيمان",
    description:
      "مجموعة شاملة ومصنّفة من الأدعية المأثورة الصحيحة من القرآن الكريم والسنة النبوية الشريفة للفرج والرزق والشفاء والاستغفار.",
    keywords:
      "أدعية, دعاء, أدعية مأثورة, دعاء من القرآن, دعاء من السنة, أدعية الفرج والرزق, نور الإيمان",
    heading: "الأدعية المأثورة",
  },
  "/quran": {
    path: "/quran",
    title: "القرآن الكريم كاملاً بالرسم العثماني مع التلاوة | نور الإيمان",
    description:
      "القرآن الكريم كاملاً بالرسم العثماني مع تلاوات صوتية لمشاهير القراء، قراءة واستماع لجميع سور القرآن الكريم بسهولة مع وضع القراءة المريح للعين.",
    keywords:
      "القرآن الكريم, قراءة القرآن, مصحف, الرسم العثماني, تلاوة القرآن, سور القرآن, نور الإيمان",
    heading: "القرآن الكريم",
  },
  "/tasbih": {
    path: "/tasbih",
    title: "السبحة الإلكترونية | عدّاد التسبيح والاستغفار | نور الإيمان",
    description:
      "سبحة إلكترونية تفاعلية تساعدك على المداومة على التسبيح والتحميد والتكبير والاستغفار مع حفظ مجموع تسبيحاتك اليومية.",
    keywords:
      "السبحة الإلكترونية, تسبيح, عداد التسبيح, استغفار, ذكر الله, نور الإيمان",
    heading: "السبحة الإلكترونية",
  },
  "/quiz": {
    path: "/quiz",
    title: "اختبارات دينية تفاعلية | اختبر معلوماتك الإسلامية | نور الإيمان",
    description:
      "اختبارات دينية تفاعلية وأسئلة إسلامية في القرآن الكريم والسيرة النبوية والفقه مع تصحيح فوري وشرح للإجابات.",
    keywords:
      "اختبارات دينية, أسئلة إسلامية, مسابقات دينية, اختبر معلوماتك الدينية, نور الإيمان",
    heading: "الاختبار الديني",
  },
};

/**
 * Normalizes a URL pathname by stripping query/hash and trailing slashes
 * (except for the root "/" path) so crawler signals and canonical URLs stay consistent.
 */
export function normalizePath(path: string): string {
  if (!path) return "/";
  const clean = path.split(/[?#]/)[0].trim();
  if (!clean || clean === "/") return "/";
  const withLeadingSlash = clean.startsWith("/") ? clean : `/${clean}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

export function isIndexablePath(path: string): boolean {
  return PUBLIC_PATHS.includes(normalizePath(path));
}

export function getCanonicalUrl(path: string): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? `${SITE_URL}/` : `${SITE_URL}${normalized}`;
}