export const SITE_URL = "https://al-noor-quest.lovable.app";

export const PUBLIC_PATHS = ["/", "/morning", "/evening", "/duas", "/quran", "/tasbih", "/quiz"];

/**
 * Descriptive URL aliases that map human-readable SEO slugs to canonical public routes.
 */
export const DESCRIPTIVE_ROUTE_ALIASES: Record<string, string> = {
  "/azkar-al-sabah": "/morning",
  "/morning-azkar": "/morning",
  "/azkar-al-masaa": "/evening",
  "/evening-azkar": "/evening",
  "/islamic-duas": "/duas",
  "/holy-quran": "/quran",
  "/electronic-tasbih": "/tasbih",
  "/islamic-quiz": "/quiz",
};

/**
 * Descriptive URL slugs for Dua categories (/duas/:categorySlug)
 */
export const DUA_CATEGORY_SLUGS: Record<
  string,
  { slug: string; category: string; aliases: string[]; title: string; description: string }
> = {
  "quranic-duas": {
    slug: "quranic-duas",
    category: "أدعية قرآنية",
    aliases: ["قرآنية", "أدعية قرآنية"],
    title: "أدعية قرآنية مكتوبة من القرآن الكريم | نور الإيمان",
    description:
      "جوامع الأدعية القرآنية المباركة المكتوبة بالتشكيل من آيات القرآن الكريم للمغفرة والرحمة والهداية وصلاح الدنيا والآخرة.",
  },
  "prophetic-duas": {
    slug: "prophetic-duas",
    category: "أدعية نبوية",
    aliases: ["نبوية", "أدعية نبوية"],
    title: "أدعية نبوية صحيحة من السنة الشريفة | نور الإيمان",
    description:
      "أدعية نبوية جامعة ومأثورة عن النبي ﷺ من الصحيحين وكتب السنة الصحيحة لخير الدنيا والآخرة.",
  },
  "istighfar-forgiveness": {
    slug: "istighfar-forgiveness",
    category: "المغفرة والرحمة",
    aliases: ["الاستغفار", "المغفرة والرحمة", "أدعية الاستغفار"],
    title: "أدعية المغفرة والرحمة والاستغفار مكتوبة | نور الإيمان",
    description:
      "أفضل صيغ وأدعية الاستغفار والتوبة والمغفرة والرحمة من القرآن الكريم والسنة النبوية الصحيحة.",
  },
  "relief-and-rizq": {
    slug: "relief-and-rizq",
    category: "تفريج الكرب",
    aliases: ["تفريج الكرب", "الفرج والرزق", "أدعية الفرج والرزق"],
    title: "أدعية الفرج وتفريج الكرب والهم | نور الإيمان",
    description:
      "أدعية مأثورة صحيحة لتفريج الهم والكرب وقضاء الدين وتيسير الأمور وطلب الفرج القريب.",
  },
  "rizq-and-tawfiq": {
    slug: "rizq-and-tawfiq",
    category: "الرزق والتوفيق",
    aliases: ["الرزق والتوفيق", "الرزق"],
    title: "أدعية الرزق والتوفيق والبركة | نور الإيمان",
    description:
      "أدعية طلب الرزق الحلال الطيب والعلم النافع والتوفيق والبركة في المال والعمل من السنة النبوية.",
  },
  "healing-and-wellbeing": {
    slug: "healing-and-wellbeing",
    category: "الشفاء والعافية",
    aliases: ["الشفاء والعافية", "الشفاء"],
    title: "أدعية الشفاء والعافية والرقية الشرعية | نور الإيمان",
    description:
      "أدعية الشفاء للمريض وطلب العافية في البدن والسمع والبصر من السنة النبوية الصحيحة.",
  },
};

export function getDuaCategorySlug(categoryName: string): string | undefined {
  const normalized = categoryName.trim();
  const entry = Object.values(DUA_CATEGORY_SLUGS).find(
    (item) => item.category === normalized || item.aliases.includes(normalized)
  );
  return entry?.slug;
}

export interface PopularSurahLink {
  number: number;
  name: string;
  englishName: string;
  slug: string;
  ayahs: number;
  revelationType: "Meccan" | "Medinan";
}

export const POPULAR_SURAHS: PopularSurahLink[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", slug: "1-al-fatiha", ayahs: 7, revelationType: "Meccan" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", slug: "2-al-baqarah", ayahs: 286, revelationType: "Medinan" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", slug: "18-al-kahf", ayahs: 110, revelationType: "Meccan" },
  { number: 36, name: "يس", englishName: "Ya-Sin", slug: "36-ya-sin", ayahs: 83, revelationType: "Meccan" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", slug: "55-ar-rahman", ayahs: 78, revelationType: "Medinan" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqia", slug: "56-al-waqia", ayahs: 96, revelationType: "Meccan" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", slug: "67-al-mulk", ayahs: 30, revelationType: "Meccan" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", slug: "112-al-ikhlas", ayahs: 4, revelationType: "Meccan" },
];

export function createSurahSlug(surahNumber: number, englishName?: string): string {
  if (!englishName) return String(surahNumber);
  const cleanSlug = englishName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleanSlug ? `${surahNumber}-${cleanSlug}` : String(surahNumber);
}

export function parseSurahNumberFromSlug(slug?: string): number | null {
  if (!slug) return null;
  const match = slug.trim().match(/^(\d{1,3})(?:-|$)/);
  if (!match) return null;
  const num = Number(match[1]);
  return num >= 1 && num <= 114 ? num : null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RouteSeoMeta {
  path: string;
  descriptiveSlug?: string;
  title: string;
  description: string;
  keywords: string;
  heading: string;
  ctaLabel: string;
  faqs?: FaqItem[];
}

export const HOME_FAQS: FaqItem[] = [
  {
    question: "متى يبدأ وقت قراءة أذكار الصباح وأذكار المساء؟",
    answer:
      "يبدأ وقت أذكار الصباح من بعد صلاة الفجر ويمتد حتى طلوع الشمس (ويجوز قراءتها حتى الضحى لمن فاته وقتها)، بينما يبدأ وقت أذكار المساء من بعد صلاة العصر ويمتد حتى غروب الشمس وأول الليل.",
  },
  {
    question: "هل جميع الأذكار والأدعية في منصة نور الإيمان موثّقة؟",
    answer:
      "نعم، جميع أذكار الصباح والمساء والأدعية المأثورة في منصة نور الإيمان مأخوذة من القرآن الكريم والسنة النبوية الصحيحة (كتاب حصن المسلم) مع بيان المصدر وعدد مرات التكرار وفضل كل ذكر.",
  },
  {
    question: "كيف يمكنني الاستماع إلى القرآن الكريم وتفعيل وضع القراءة المريح للعين؟",
    answer:
      "من قسم القرآن الكريم يمكنك اختيار أي سورة من سور المصحف الشريف الـ 114 بالرسم العثماني عبر رابط وصفي خاص بكل سورة، واختيار القارئ المفضل لديك للاستماع المتواصل، مع إمكانية تكبير حجم الخط وتغيير لون الخلفية وتفعيل وضع الراحة للعين (الوضع الليلي).",
  },
  {
    question: "كيف أحفظ الأذكار والأدعية التي أقرؤها يومياً للوصول السريع؟",
    answer:
      "يمكنك الضغط على أيقونة القلب بجانب أي ذكر أو دعاء لإضافته فوراً إلى صفحة «مفضلتك»، حيث يتم حفظها على جهازك للرجوع إليها في أي وقت مع عدّاد تكرار تفاعلي.",
  },
];

export const ROUTE_SEO_META: Record<string, RouteSeoMeta> = {
  "/": {
    path: "/",
    title: "نور الإيمان | أذكار الصباح والمساء والأدعية والقرآن الكريم",
    description:
      "منصة نور الإيمان الإسلامية المتكاملة: أذكار الصباح والمساء مكتوبة من حصن المسلم، الأدعية المأثورة، القرآن الكريم بالرسم العثماني مع التلاوة، مواقيت الصلاة، والسبحة الإلكترونية.",
    keywords:
      "نور الإيمان, أذكار الصباح, أذكار المساء, اذكار الصباح مكتوبة, أدعية مأثورة, القرآن الكريم, مواقيت الصلاة, حصن المسلم, السبحة الإلكترونية, اختبارات دينية",
    heading: "نور الإيمان — أذكار وأدعية والقرآن الكريم",
    ctaLabel: "الصفحة الرئيسية لنور الإيمان",
    faqs: HOME_FAQS,
  },
  "/morning": {
    path: "/morning",
    descriptiveSlug: "/azkar-al-sabah",
    title: "أذكار الصباح مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "اقرأ أذكار الصباح مكتوبة كاملة بالتشكيل من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وبيان فضل كل ذكر ومصدره.",
    keywords:
      "أذكار الصباح, اذكار الصباح مكتوبة, أذكار الصباح كاملة, دعاء الصباح, حصن المسلم أذكار الصباح, اذكار الصباح بالتشكيل, نور الإيمان",
    heading: "أذكار الصباح",
    ctaLabel: "تصفّح أذكار الصباح مكتوبة",
    faqs: [
      {
        question: "متى يبدأ وقت أذكار الصباح ومتى ينتهي؟",
        answer:
          "يبدأ وقت أذكار الصباح من بعد صلاة الفجر إلى طلوع الشمس، ويمتد وقتها المختار حتى ارتفاع الشمس قيد رمح أو انتهاء وقت الضحى لمن شغل عنها.",
      },
      {
        question: "كم عدد مرات تكرار أذكار الصباح؟",
        answer:
          "تتراوح أذكار الصباح بين مرة واحدة (مثل آية الكرسي وسيد الاستغفار)، و3 مرات (مثل المعوذات وأذكار الحفظ)، و7 مرات (حسبي الله لا إله إلا هو)، و100 مرة (سبحان الله وبحمده).",
      },
    ],
  },
  "/evening": {
    path: "/evening",
    descriptiveSlug: "/azkar-al-masaa",
    title: "أذكار المساء مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "اقرأ أذكار المساء مكتوبة كاملة بالتشكيل من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وبيان فضل كل ذكر ومصدره.",
    keywords:
      "أذكار المساء, اذكار المساء مكتوبة, أذكار المساء كاملة, دعاء المساء, حصن المسلم أذكار المساء, اذكار المساء بالتشكيل, نور الإيمان",
    heading: "أذكار المساء",
    ctaLabel: "تصفّح أذكار المساء مكتوبة",
    faqs: [
      {
        question: "متى يبدأ وقت أذكار المساء؟",
        answer:
          "يبدأ وقت أذكار المساء من بعد صلاة العصر ويمتد إلى غروب الشمس ومضي صدر من الليل.",
      },
      {
        question: "ما فضل المحافظة على أذكار المساء يومياً؟",
        answer:
          "المحافظة على أذكار المساء تحفظ المسلم بإذن الله من شرور الليل والهوام والشيطان، وتورث طمأنينة القلب ومغفرة الذنوب وزيادة الحسنات.",
      },
    ],
  },
  "/duas": {
    path: "/duas",
    descriptiveSlug: "/islamic-duas",
    title: "الأدعية المأثورة من القرآن والسنة النبوية | نور الإيمان",
    description:
      "مجموعة شاملة ومصنّفة من الأدعية المأثورة الصحيحة من القرآن الكريم والسنة النبوية الشريفة للفرج والرزق والشفاء والاستغفار والهداية.",
    keywords:
      "أدعية, دعاء, أدعية مأثورة, دعاء من القرآن, دعاء من السنة, أدعية الفرج والرزق, دعاء الشفاء, نور الإيمان",
    heading: "الأدعية المأثورة",
    ctaLabel: "اقرأ الأدعية المأثورة",
    faqs: [
      {
        question: "ما هي أقسام الأدعية المأثورة المتوفرة في المنصة؟",
        answer:
          "تشمل المنصة أدعية قرآنية، أدعية نبوية جامعة، أدعية المغفرة والرحمة، أدعية تفريج الكرب والهم، أدعية الرزق والتوفيق، وأدعية الشفاء والعافية.",
      },
      {
        question: "هل يمكنني حفظ الأدعية المفضلة للرجوع إليها لاحقاً؟",
        answer:
          "نعم، يمكنك الضغط على زر «حفظ في المفضلة» بجانب أي دعاء ليتم حفظه مباشرة في صفحة مفضلتك.",
      },
    ],
  },
  "/quran": {
    path: "/quran",
    descriptiveSlug: "/holy-quran",
    title: "القرآن الكريم كاملاً بالرسم العثماني مع التلاوة | نور الإيمان",
    description:
      "تصفّح القرآن الكريم كاملاً بالرسم العثماني برواية حفص عن عاصم مع تلاوات صوتية لمشاهير القراء ووضع القراءة الليلي المريح للعين.",
    keywords:
      "القرآن الكريم, قراءة القرآن, مصحف, الرسم العثماني, تلاوة القرآن, سور القرآن, استماع القرآن الكريم, نور الإيمان",
    heading: "القرآن الكريم",
    ctaLabel: "قراءة واستماع القرآن الكريم",
    faqs: [
      {
        question: "ما هي الرواية المعتمدة في مصحف منصة نور الإيمان؟",
        answer:
          "المصحف معروض بالرسم العثماني برواية حفص عن عاصم ويشمل جميع سور القرآن الكريم الـ 114 مع إمكانية الاستماع لكل آية.",
      },
      {
        question: "من هم القراء المتاحون للاستماع في قسم القرآن الكريم؟",
        answer:
          "يتوفر الاستماع لنخبة من كبار القراء مثل الشيخ محمود خليل الحصري، محمد صديق المنشاوي، عبد الباسط عبد الصمد، مشاري العفاسي، عبد الرحمن السديس، وماهر المعيقلي.",
      },
    ],
  },
  "/tasbih": {
    path: "/tasbih",
    descriptiveSlug: "/electronic-tasbih",
    title: "السبحة الإلكترونية | عدّاد التسبيح والاستغفار | نور الإيمان",
    description:
      "سبحة إلكترونية تفاعلية تساعدك على المداومة على التسبيح والتحميد والتكبير والاستغفار والصلاة على النبي مع حفظ مجموع تسبيحاتك اليومية.",
    keywords:
      "السبحة الإلكترونية, سبحة الكترونية, تسبيح, عداد التسبيح, استغفار, ذكر الله, سبحان الله وبحمده, نور الإيمان",
    heading: "السبحة الإلكترونية",
    ctaLabel: "افتح السبحة الإلكترونية",
    faqs: [
      {
        question: "كيف تعمل السبحة الإلكترونية وهل تحفظ عدد التسبيحات؟",
        answer:
          "تتيح لك السبحة الإلكترونية اختيار الذكر وتحديد الهدف اليومي (33 أو 100 مرة) مع تنبيه عند إتمام العدد وحفظ تلقائي لإجمالي تسبيحاتك وسجل جلساتك على جهازك.",
      },
    ],
  },
  "/quiz": {
    path: "/quiz",
    descriptiveSlug: "/islamic-quiz",
    title: "اختبارات دينية تفاعلية | اختبر معلوماتك الإسلامية | نور الإيمان",
    description:
      "اختبارات دينية تفاعلية وأسئلة إسلامية في القرآن الكريم والسيرة النبوية والفقه والعقيدة مع تصحيح فوري وشرح مفصّل للإجابات.",
    keywords:
      "اختبارات دينية, أسئلة إسلامية, مسابقات دينية, اختبر معلوماتك الدينية, أسئلة في القرآن والسيرة, نور الإيمان",
    heading: "الاختبار الديني",
    ctaLabel: "ابدأ الاختبار الديني",
    faqs: [
      {
        question: "ما هي مجالات الأسئلة في الاختبار الديني؟",
        answer:
          "يتضمن الاختبار الديني أسئلة متنوعة في علوم القرآن الكريم، السيرة النبوية، الفقه والعبادات، العقيدة، والصحابة الكرام مع شرح توضيحي لكل إجابة.",
      },
    ],
  },
};

/**
 * Normalizes a URL pathname by stripping query/hash, trailing slashes,
 * and resolving descriptive route aliases to their canonical path.
 */
export function normalizePath(path: string): string {
  if (!path) return "/";
  const clean = path.split(/[?#]/)[0].trim();
  if (!clean || clean === "/") return "/";
  const withLeadingSlash = clean.startsWith("/") ? clean : `/${clean}`;
  const stripped = withLeadingSlash.replace(/\/+$/, "") || "/";
  return DESCRIPTIVE_ROUTE_ALIASES[stripped] ?? stripped;
}

export function isIndexablePath(path: string): boolean {
  const normalized = normalizePath(path);
  if (PUBLIC_PATHS.includes(normalized)) return true;

  // Descriptive Surah URLs: /quran/1-al-fatiha .. /quran/114-an-nas
  if (normalized.startsWith("/quran/")) {
    const slug = normalized.slice("/quran/".length);
    return parseSurahNumberFromSlug(slug) !== null;
  }

  // Descriptive Dua Category URLs: /duas/quranic-duas, etc.
  if (normalized.startsWith("/duas/")) {
    const slug = normalized.slice("/duas/".length);
    return Boolean(DUA_CATEGORY_SLUGS[slug]);
  }

  return false;
}

export function getCanonicalUrl(path: string): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? `${SITE_URL}/` : `${SITE_URL}${normalized}`;
}