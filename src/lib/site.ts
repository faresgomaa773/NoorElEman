export const SITE_URL = "https://nooreleman.site";

export const SITE_ALTERNATE_NAMES = [
  "نور الإيمان",
  "نور الايمان",
  "منصة نور الإيمان",
  "موقع نور الإيمان",
  "منصة نور الإيمان الإسلامية",
  "Noor El Eman",
  "nooreleman.site",
];

export const PUBLIC_PATHS = ["/", "/morning", "/evening", "/duas", "/hadith", "/quran", "/tasbih", "/quiz"];

/**
 * Descriptive URL aliases that map human-readable SEO slugs to canonical public routes.
 */
export const DESCRIPTIVE_ROUTE_ALIASES: Record<string, string> = {
  "/azkar-al-sabah": "/morning",
  "/morning-azkar": "/morning",
  "/azkar-al-masaa": "/evening",
  "/evening-azkar": "/evening",
  "/islamic-duas": "/duas",
  "/prophetic-hadiths": "/hadith",
  "/ahadith-nabawiya": "/hadith",
  "/ahadith": "/hadith",
  "/holy-quran": "/quran",
  "/electronic-tasbih": "/tasbih",
  "/islamic-quiz": "/quiz",
};

/**
 * Descriptive URL slugs for Hadith books & collections (/hadith/:categorySlug)
 */
export const HADITH_CATEGORY_SLUGS: Record<
  string,
  { slug: string; category: string; aliases: string[]; title: string; description: string }
> = {
  "sahih-al-bukhari": {
    slug: "sahih-al-bukhari",
    category: "صحيح البخاري",
    aliases: ["البخاري", "صحيح البخاري", "bukhari", "ara-bukhari"],
    title: "صحيح البخاري كاملاً جميع الأبواب والأحاديث بالتشكيل | نور الإيمان",
    description:
      "تصفّح كتاب الجامع المسند الصحيح المختصر (صحيح البخاري) للإمام محمد بن إسماعيل البخاري كاملاً بجميع كتبه الـ 97 وأحاديثه الـ 7563 مضبوطة بالتشكيل.",
  },
  "sahih-muslim": {
    slug: "sahih-muslim",
    category: "صحيح مسلم",
    aliases: ["مسلم", "صحيح مسلم", "muslim", "ara-muslim"],
    title: "صحيح مسلم كاملاً جميع الكتب والأحاديث بالتشكيل | نور الإيمان",
    description:
      "اقرأ كتاب المسند الصحيح المختصر (صحيح مسلم) للإمام مسلم بن الحجاج النيسابوري كاملاً بجميع كتبه الـ 56 وأحاديثه الصحيحة مضبوطة بالتشكيل.",
  },
  "sunan-abi-dawud": {
    slug: "sunan-abi-dawud",
    category: "سنن أبي داود",
    aliases: ["أبو داود", "سنن أبي داود", "abudawud", "ara-abudawud"],
    title: "سنن أبي داود كاملاً جميع الأبواب والأحاديث مع درجة الصحة | نور الإيمان",
    description:
      "تصفّح كتاب سنن أبي داود للإمام سليمان بن الأشعث السجستاني كاملاً بجميع أبوابه الفقهية وأحاديثه الـ 5274 مع بيان حكم الحديث.",
  },
  "jami-at-tirmidhi": {
    slug: "jami-at-tirmidhi",
    category: "جامع الترمذي",
    aliases: ["الترمذي", "جامع الترمذي", "سنن الترمذي", "tirmidhi", "ara-tirmidhi"],
    title: "جامع الترمذي (سنن الترمذي) كاملاً جميع الأبواب والأحاديث | نور الإيمان",
    description:
      "تصفّح كتاب الجامع الكبير (سنن الترمذي) للإمام أبي عيسى محمد بن عيسى الترمذي كاملاً بجميع أبوابه الـ 49 وأحاديثه مع درجة الصحة.",
  },
  "sunan-an-nasai": {
    slug: "sunan-an-nasai",
    category: "سنن النسائي",
    aliases: ["النسائي", "سنن النسائي", "المجتبى", "nasai", "ara-nasai"],
    title: "سنن النسائي (المجتبى) كاملاً جميع الكتب والأحاديث | نور الإيمان",
    description:
      "اقرأ كتاب المجتبى من السنن الكبرى (سنن النسائي) للإمام أحمد بن شعيب النسائي كاملاً بجميع كتبه الـ 51 وأحاديثه الـ 5765 بالتشكيل.",
  },
  "sunan-ibn-majah": {
    slug: "sunan-ibn-majah",
    category: "سنن ابن ماجه",
    aliases: ["ابن ماجه", "سنن ابن ماجه", "ibnmajah", "ara-ibnmajah"],
    title: "سنن ابن ماجه كاملاً جميع الأبواب والأحاديث مع التخريج | نور الإيمان",
    description:
      "تصفّح كتاب سنن ابن ماجه للإمام محمد بن يزيد القزويني كاملاً بجميع أبوابه الـ 37 وأحاديثه الـ 4343 مضبوطة بالتشكيل.",
  },
  "muwatta-malik": {
    slug: "muwatta-malik",
    category: "موطأ الإمام مالك",
    aliases: ["موطأ مالك", "الموطأ", "موطأ الإمام مالك", "malik", "ara-malik"],
    title: "موطأ الإمام مالك كاملاً جميع الكتب والأحاديث | نور الإيمان",
    description:
      "اقرأ كتاب الموطأ لإمام دار الهجرة مالك بن أنس كاملاً بجميع أبوابه الـ 61 وأحاديثه وآثاره الفقهية مضبوطة بالتشكيل.",
  },
  "al-arbaun-an-nawawiyyah": {
    slug: "al-arbaun-an-nawawiyyah",
    category: "الأربعون النووية",
    aliases: ["الأربعون النووية", "جوامع الكلم والأربعون النووية", "nawawi", "ara-nawawi"],
    title: "متن الأربعين النووية كاملاً (42 حديثاً) مع الشرح والفوائد | نور الإيمان",
    description:
      "اقرأ متن الأربعين النووية للإمام يحيى بن شرف النووي كاملاً (42 حديثاً من جوامع كلم النبي ﷺ) بالتشكيل مع الشرح والفوائد.",
  },
  "al-ahadith-al-qudsiyyah": {
    slug: "al-ahadith-al-qudsiyyah",
    category: "الأحاديث القدسية",
    aliases: ["الأحاديث القدسية", "الأربعون القدسية", "qudsi", "ara-qudsi"],
    title: "الأحاديث القدسية الأربعون كاملة بالتشكيل | نور الإيمان",
    description:
      "تصفّح مجموعة الأحاديث القدسية الصحيحة التي يرويها النبي ﷺ عن ربه عز وجل كاملة بالتشكيل.",
  },
  "jawami-wahadith-nawawi": {
    slug: "jawami-wahadith-nawawi",
    category: "جوامع الكلم والأربعون النووية",
    aliases: ["جوامع الكلم"],
    title: "أحاديث الأربعين النووية وجوامع الكلم مكتوبة مع الشرح | نور الإيمان",
    description:
      "أحاديث الأربعين النووية وجوامع كلم النبي ﷺ مكتوبة بالتشكيل الكامل مع بيان الراوي والمصدر وشرح الفوائد المستفادة.",
  },
  "aqidah-and-iman": {
    slug: "aqidah-and-iman",
    category: "العقيدة والإيمان",
    aliases: ["العقيدة والإيمان", "الإيمان", "التوحيد"],
    title: "أحاديث العقيدة والإيمان والتوحيد الصحيحة | نور الإيمان",
    description:
      "أحاديث نبوية صحيحة في أصول العقيدة وأركان الإيمان والتوكل على الله وحسن الظن به من الصحيحين وكتب السنة.",
  },
  "akhlaq-and-adab": {
    slug: "akhlaq-and-adab",
    category: "الأخلاق والآداب الإسلامية",
    aliases: ["الأخلاق والآداب الإسلامية", "الأخلاق", "الآداب"],
    title: "أحاديث الأخلاق والآداب الإسلامية وحسن الخلق | نور الإيمان",
    description:
      "أحاديث نبوية شريفة في فضل حسن الخلق والصدق والرفق والحلم والكلمة الطيبة وآداب المسلم اليومية.",
  },
  "ibadat-and-virtues": {
    slug: "ibadat-and-virtues",
    category: "العبادات وفضائل الأعمال",
    aliases: ["العبادات وفضائل الأعمال", "فضائل الأعمال", "العبادات"],
    title: "أحاديث العبادات وفضائل الأعمال والذكر والقرآن | نور الإيمان",
    description:
      "أحاديث صحيحة في فضائل الصلاة والقرآن والذكر والتسبيح والصدقة وأحب الأعمال إلى الله تعالى.",
  },
  "raqaiq-and-zuhd": {
    slug: "raqaiq-and-zuhd",
    category: "الرقائق والزهد والورع",
    aliases: ["الرقائق والزهد والورع", "الزهد", "الرقائق"],
    title: "أحاديث الرقائق والزهد والورع وتزكية القلوب | نور الإيمان",
    description:
      "أحاديث نبوية مؤثرة في تزكية النفس وإصلاح القلب والورع والزهد في الدنيا والاستعداد للآخرة.",
  },
  "family-and-muamalat": {
    slug: "family-and-muamalat",
    category: "الأسرة والمعاملات والتكافل",
    aliases: ["الأسرة والمعاملات والتكافل", "الأسرة", "المعاملات"],
    title: "أحاديث الأسرة وبر الوالدين والتراحم والتكافل | نور الإيمان",
    description:
      "أحاديث نبوية صحيحة في بر الوالدين وصلة الرحم وحسن الجوار وقضاء الحوائج والتراحم بين المسلمين.",
  },
};

export function getHadithCategorySlug(categoryName: string): string | undefined {
  const normalized = categoryName.trim();
  const entry = Object.values(HADITH_CATEGORY_SLUGS).find(
    (item) => item.category === normalized || item.aliases.includes(normalized)
  );
  return entry?.slug;
}

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
  "family-and-parents": {
    slug: "family-and-parents",
    category: "الوالدين والأهل",
    aliases: ["الوالدين والأهل", "بر الوالدين", "الأبناء والذرية"],
    title: "أدعية للوالدين والأهل وصلاح الذرية | نور الإيمان",
    description:
      "أدعية مأثورة من القرآن الكريم والسنة النبوية لبر الوالدين والرحمة بهما وصلاح الزوج والأبناء والذرية.",
  },
  "daily-worship-duas": {
    slug: "daily-worship-duas",
    category: "أدعية اليوم والعبادات",
    aliases: ["أدعية اليوم والعبادات", "أدعية يومية", "أدعية الصلاة والاستخارة"],
    title: "أدعية اليوم والعبادات والاستخارة والسفر | نور الإيمان",
    description:
      "الأدعية اليومية المأثورة للمسلم: دعاء الاستخارة، دعاء الخروج من المنزل، دعاء السفر، ودخول المسجد.",
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
      "موقع ومنصة نور الإيمان (نور الايمان) الإسلامية المتكاملة: أذكار الصباح والمساء مكتوبة من حصن المسلم، الأدعية المأثورة، كتب الحديث الشريف، القرآن الكريم بالرسم العثماني مع التلاوة، مواقيت الصلاة، والسبحة الإلكترونية.",
    keywords:
      "نور الإيمان, نور الايمان, موقع نور الإيمان, منصة نور الإيمان, nooreleman, أذكار الصباح, أذكار المساء, اذكار الصباح مكتوبة, أدعية مأثورة, الأحاديث النبوية, القرآن الكريم, مواقيت الصلاة, حصن المسلم, السبحة الإلكترونية, اختبارات دينية",
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
          "تشمل المنصة 8 أقسام رئيسية: أدعية قرآنية، أدعية نبوية جامعة، أدعية المغفرة والرحمة، أدعية تفريج الكرب والهم، أدعية الرزق والتوفيق، أدعية الشفاء والعافية، أدعية الوالدين والأهل، وأدعية اليوم والعبادات.",
      },
      {
        question: "هل يمكنني حفظ الأدعية المفضلة للرجوع إليها لاحقاً؟",
        answer:
          "نعم، يمكنك الضغط على زر «حفظ في المفضلة» بجانب أي دعاء ليتم حفظه مباشرة في صفحة مفضلتك.",
      },
    ],
  },
  "/hadith": {
    path: "/hadith",
    descriptiveSlug: "/prophetic-hadiths",
    title: "الأحاديث النبوية الشريفة الصحيحة مع الشرح | نور الإيمان",
    description:
      "تصفّح الأحاديث النبوية الشريفة الصحيحة من الأربعين النووية والصحيحين (البخاري ومسلم) مكتوبة بالتشكيل مع بيان الراوي والمصدر وشرح الفوائد المستفادة.",
    keywords:
      "الأحاديث النبوية, أحاديث صحيحة, الأربعون النووية, أحاديث البخاري ومسلم, جوامع الكلم, حديث شريف مع الشرح, السنة النبوية, نور الإيمان",
    heading: "الأحاديث النبوية الشريفة",
    ctaLabel: "تصفّح الأحاديث النبوية الشريفة",
    faqs: [
      {
        question: "ما هي مصادر الأحاديث النبوية المعروضة في منصة نور الإيمان؟",
        answer:
          "جميع الأحاديث المعروضة مأخوذة من أصح كتب السنة النبوية المعتمدة مثل صحيح البخاري وصحيح مسلم ومتن الأربعين النووية للإمام النووي، مع ذكر الصحابي الراوي ودرجة الحديث وشرح موجز لفوائده.",
      },
      {
        question: "هل يمكنني البحث في الأحاديث أو تصفيتها حسب الموضوع؟",
        answer:
          "نعم، يمكنك البحث الفوري بالكلمات أو اسم الصحابي الراوي أو المصدر، كما يمكنك التصفية حسب الأبواب الموضوعية مثل جوامع الكلم، العقيدة والإيمان، الأخلاق والآداب، والعبادات وفضائل الأعمال.",
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

export interface SitemapEntry {
  path: string;
  section: "pages" | "hadith" | "duas" | "quran";
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
}

export const SITEMAP_LASTMOD = "2026-05-25";

export const SITEMAP_FILES = [
  "/sitemap.xml",
  "/sitemap-index.xml",
  "/sitemap-pages.xml",
  "/sitemap-hadith.xml",
  "/sitemap-duas.xml",
  "/sitemap-quran.xml",
] as const;

export const SITEMAP_ENTRIES: SitemapEntry[] = [
  // 1. Main Public Pages (8 routes)
  { path: "/", section: "pages", changefreq: "daily", priority: "1.0" },
  { path: "/morning", section: "pages", changefreq: "daily", priority: "0.9" },
  { path: "/evening", section: "pages", changefreq: "daily", priority: "0.9" },
  { path: "/duas", section: "pages", changefreq: "weekly", priority: "0.9" },
  { path: "/hadith", section: "pages", changefreq: "weekly", priority: "0.9" },
  { path: "/quran", section: "pages", changefreq: "weekly", priority: "0.9" },
  { path: "/tasbih", section: "pages", changefreq: "monthly", priority: "0.8" },
  { path: "/quiz", section: "pages", changefreq: "monthly", priority: "0.8" },

  // 2. Complete Hadith Books & Thematic Collections (15 routes)
  ...Object.values(HADITH_CATEGORY_SLUGS).map(
    (item): SitemapEntry => ({
      path: `/hadith/${item.slug}`,
      section: "hadith",
      changefreq: "weekly",
      priority: "0.85",
    })
  ),

  // 3. Dua Categories (8 routes)
  ...Object.values(DUA_CATEGORY_SLUGS).map(
    (item): SitemapEntry => ({
      path: `/duas/${item.slug}`,
      section: "duas",
      changefreq: "weekly",
      priority: "0.8",
    })
  ),

  // 4. Featured Quran Surahs (8 routes)
  ...POPULAR_SURAHS.map(
    (surah): SitemapEntry => ({
      path: `/quran/${surah.slug}`,
      section: "quran",
      changefreq: "weekly",
      priority: "0.85",
    })
  ),
];

export const SITEMAP_PATHS: string[] = SITEMAP_ENTRIES.map((entry) => entry.path);

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

  // Descriptive Hadith Category URLs: /hadith/jawami-wahadith-nawawi, etc.
  if (normalized.startsWith("/hadith/")) {
    const slug = normalized.slice("/hadith/".length);
    return Boolean(HADITH_CATEGORY_SLUGS[slug]);
  }

  return false;
}

export function getCanonicalUrl(path: string): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? `${SITE_URL}/` : `${SITE_URL}${normalized}`;
}