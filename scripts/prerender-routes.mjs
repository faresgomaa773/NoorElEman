import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const SITE_URL = "https://al-noor-quest.lovable.app";
const LASTMOD = "2026-05-25";
const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/08546d39-2455-4a48-b81e-8ff8a037e911/id-preview-cfd3ae0f--3668b397-3abf-47a0-8c92-b6878c69e5eb.lovable.app-1776933579072.png";
const PUBLIC_DIR = join(process.cwd(), "public");
const DIST_DIR = join(process.cwd(), "dist");
const BASE_HTML_PATH = join(DIST_DIR, "index.html");

const PUBLIC_ROUTES = [
  {
    path: "/morning",
    section: "pages",
    changefreq: "daily",
    priority: "0.9",
    title: "أذكار الصباح مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "اقرأ أذكار الصباح مكتوبة كاملة بالتشكيل من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وبيان فضل كل ذكر ومصدره.",
    keywords:
      "أذكار الصباح, اذكار الصباح مكتوبة, أذكار الصباح كاملة, دعاء الصباح, حصن المسلم أذكار الصباح, اذكار الصباح بالتشكيل, نور الإيمان",
    heading: "أذكار الصباح",
  },
  {
    path: "/evening",
    section: "pages",
    changefreq: "daily",
    priority: "0.9",
    title: "أذكار المساء مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "اقرأ أذكار المساء مكتوبة كاملة بالتشكيل من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وبيان فضل كل ذكر ومصدره.",
    keywords:
      "أذكار المساء, اذكار المساء مكتوبة, أذكار المساء كاملة, دعاء المساء, حصن المسلم أذكار المساء, اذكار المساء بالتشكيل, نور الإيمان",
    heading: "أذكار المساء",
  },
  {
    path: "/duas",
    section: "pages",
    changefreq: "weekly",
    priority: "0.9",
    title: "الأدعية المأثورة من القرآن والسنة النبوية | نور الإيمان",
    description:
      "مجموعة شاملة ومصنّفة من الأدعية المأثورة الصحيحة من القرآن الكريم والسنة النبوية الشريفة للفرج والرزق والشفاء والاستغفار والهداية.",
    keywords:
      "أدعية, دعاء, أدعية مأثورة, دعاء من القرآن, دعاء من السنة, أدعية الفرج والرزق, دعاء الشفاء, نور الإيمان",
    heading: "الأدعية المأثورة",
  },
  {
    path: "/hadith",
    section: "pages",
    changefreq: "weekly",
    priority: "0.9",
    title: "الأحاديث النبوية الشريفة الصحيحة مع الشرح | نور الإيمان",
    description:
      "تصفّح الأحاديث النبوية الشريفة الصحيحة من الأربعين النووية والصحيحين (البخاري ومسلم) مكتوبة بالتشكيل مع بيان الراوي والمصدر وشرح الفوائد المستفادة.",
    keywords:
      "الأحاديث النبوية, أحاديث صحيحة, الأربعون النووية, أحاديث البخاري ومسلم, جوامع الكلم, حديث شريف مع الشرح, السنة النبوية, نور الإيمان",
    heading: "الأحاديث النبوية الشريفة",
  },
  {
    path: "/quran",
    section: "pages",
    changefreq: "weekly",
    priority: "0.9",
    title: "القرآن الكريم كاملاً بالرسم العثماني مع التلاوة | نور الإيمان",
    description:
      "تصفّح القرآن الكريم كاملاً بالرسم العثماني برواية حفص عن عاصم مع تلاوات صوتية لمشاهير القراء ووضع القراءة الليلي المريح للعين.",
    keywords:
      "القرآن الكريم, قراءة القرآن, مصحف, الرسم العثماني, تلاوة القرآن, سور القرآن, استماع القرآن الكريم, نور الإيمان",
    heading: "القرآن الكريم",
  },
  {
    path: "/tasbih",
    section: "pages",
    changefreq: "monthly",
    priority: "0.8",
    title: "السبحة الإلكترونية | عدّاد التسبيح والاستغفار | نور الإيمان",
    description:
      "سبحة إلكترونية تفاعلية تساعدك على المداومة على التسبيح والتحميد والتكبير والاستغفار والصلاة على النبي مع حفظ مجموع تسبيحاتك اليومية.",
    keywords:
      "السبحة الإلكترونية, سبحة الكترونية, تسبيح, عداد التسبيح, استغفار, ذكر الله, سبحان الله وبحمده, نور الإيمان",
    heading: "السبحة الإلكترونية",
  },
  {
    path: "/quiz",
    section: "pages",
    changefreq: "monthly",
    priority: "0.8",
    title: "اختبارات دينية تفاعلية | اختبر معلوماتك الإسلامية | نور الإيمان",
    description:
      "اختبارات دينية تفاعلية وأسئلة إسلامية في القرآن الكريم والسيرة النبوية والفقه والعقيدة مع تصحيح فوري وشرح مفصّل للإجابات.",
    keywords:
      "اختبارات دينية, أسئلة إسلامية, مسابقات دينية, اختبر معلوماتك الدينية, أسئلة في القرآن والسيرة, نور الإيمان",
    heading: "الاختبار الديني",
  },
];

const HADITH_DEEP_ROUTES = [
  {
    path: "/hadith/sahih-al-bukhari",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "صحيح البخاري كاملاً جميع الأبواب والأحاديث بالتشكيل | نور الإيمان",
    description:
      "تصفّح كتاب الجامع المسند الصحيح المختصر (صحيح البخاري) للإمام محمد بن إسماعيل البخاري كاملاً بجميع كتبه الـ 97 وأحاديثه الـ 7563 مضبوطة بالتشكيل.",
    heading: "صحيح البخاري كاملاً",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/sahih-muslim",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "صحيح مسلم كاملاً جميع الكتب والأحاديث بالتشكيل | نور الإيمان",
    description:
      "اقرأ كتاب المسند الصحيح المختصر (صحيح مسلم) للإمام مسلم بن الحجاج النيسابوري كاملاً بجميع كتبه الـ 56 وأحاديثه الصحيحة مضبوطة بالتشكيل.",
    heading: "صحيح مسلم كاملاً",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/sunan-abi-dawud",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "سنن أبي داود كاملاً جميع الأبواب والأحاديث مع درجة الصحة | نور الإيمان",
    description:
      "تصفّح كتاب سنن أبي داود للإمام سليمان بن الأشعث السجستاني كاملاً بجميع أبوابه الفقهية وأحاديثه الـ 5274 مع بيان حكم الحديث.",
    heading: "سنن أبي داود كاملاً",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/jami-at-tirmidhi",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "جامع الترمذي (سنن الترمذي) كاملاً جميع الأبواب والأحاديث | نور الإيمان",
    description:
      "تصفّح كتاب الجامع الكبير (سنن الترمذي) للإمام أبي عيسى محمد بن عيسى الترمذي كاملاً بجميع أبوابه الـ 49 وأحاديثه مع درجة الصحة.",
    heading: "جامع الترمذي كاملاً",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/sunan-an-nasai",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "سنن النسائي (المجتبى) كاملاً جميع الكتب والأحاديث | نور الإيمان",
    description:
      "اقرأ كتاب المجتبى من السنن الكبرى (سنن النسائي) للإمام أحمد بن شعيب النسائي كاملاً بجميع كتبه الـ 51 وأحاديثه الـ 5765 بالتشكيل.",
    heading: "سنن النسائي كاملاً",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/sunan-ibn-majah",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "سنن ابن ماجه كاملاً جميع الأبواب والأحاديث مع التخريج | نور الإيمان",
    description:
      "تصفّح كتاب سنن ابن ماجه للإمام محمد بن يزيد القزويني كاملاً بجميع أبوابه الـ 37 وأحاديثه الـ 4343 مضبوطة بالتشكيل.",
    heading: "سنن ابن ماجه كاملاً",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/muwatta-malik",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "موطأ الإمام مالك كاملاً جميع الكتب والأحاديث | نور الإيمان",
    description:
      "اقرأ كتاب الموطأ لإمام دار الهجرة مالك بن أنس كاملاً بجميع أبوابه الـ 61 وأحاديثه وآثاره الفقهية مضبوطة بالتشكيل.",
    heading: "موطأ الإمام مالك كاملاً",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/al-arbaun-an-nawawiyyah",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "متن الأربعين النووية كاملاً (42 حديثاً) مع الشرح والفوائد | نور الإيمان",
    description:
      "اقرأ متن الأربعين النووية للإمام يحيى بن شرف النووي كاملاً (42 حديثاً من جوامع كلم النبي ﷺ) بالتشكيل مع الشرح والفوائد.",
    heading: "الأربعون النووية كاملاً",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/al-ahadith-al-qudsiyyah",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "الأحاديث القدسية الأربعون كاملة بالتشكيل | نور الإيمان",
    description:
      "تصفّح مجموعة الأحاديث القدسية الصحيحة التي يرويها النبي ﷺ عن ربه عز وجل كاملة بالتشكيل.",
    heading: "الأحاديث القدسية كاملاً",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/jawami-wahadith-nawawi",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "أحاديث الأربعين النووية وجوامع الكلم مكتوبة مع الشرح | نور الإيمان",
    description:
      "أحاديث الأربعين النووية وجوامع كلم النبي ﷺ مكتوبة بالتشكيل الكامل مع بيان الراوي والمصدر وشرح الفوائد المستفادة.",
    heading: "جوامع الكلم والأربعون النووية",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/aqidah-and-iman",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "أحاديث العقيدة والإيمان والتوحيد الصحيحة | نور الإيمان",
    description:
      "أحاديث نبوية صحيحة في أصول العقيدة وأركان الإيمان والتوكل على الله وحسن الظن به من الصحيحين وكتب السنة.",
    heading: "أحاديث العقيدة والإيمان",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/akhlaq-and-adab",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "أحاديث الأخلاق والآداب الإسلامية وحسن الخلق | نور الإيمان",
    description:
      "أحاديث نبوية شريفة في فضل حسن الخلق والصدق والرفق والحلم والكلمة الطيبة وآداب المسلم اليومية.",
    heading: "أحاديث الأخلاق والآداب الإسلامية",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/ibadat-and-virtues",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "أحاديث العبادات وفضائل الأعمال والذكر والقرآن | نور الإيمان",
    description:
      "أحاديث صحيحة في فضائل الصلاة والقرآن والذكر والتسبيح والصدقة وأحب الأعمال إلى الله تعالى.",
    heading: "أحاديث العبادات وفضائل الأعمال",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/raqaiq-and-zuhd",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "أحاديث الرقائق والزهد والورع وتزكية القلوب | نور الإيمان",
    description:
      "أحاديث نبوية مؤثرة في تزكية النفس وإصلاح القلب والورع والزهد في الدنيا والاستعداد للآخرة.",
    heading: "أحاديث الرقائق والزهد والورع",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
  {
    path: "/hadith/family-and-muamalat",
    section: "hadith",
    changefreq: "weekly",
    priority: "0.85",
    title: "أحاديث الأسرة وبر الوالدين والتراحم والتكافل | نور الإيمان",
    description:
      "أحاديث نبوية صحيحة في بر الوالدين وصلة الرحم وحسن الجوار وقضاء الحوائج والتراحم بين المسلمين.",
    heading: "أحاديث الأسرة والمعاملات والتكافل",
    parent: { name: "الأحاديث النبوية", path: "/hadith" },
  },
];

const DUA_DEEP_ROUTES = [
  {
    path: "/duas/quranic-duas",
    section: "duas",
    changefreq: "weekly",
    priority: "0.8",
    title: "أدعية قرآنية مكتوبة من القرآن الكريم | نور الإيمان",
    description: "جوامع الأدعية القرآنية المباركة المكتوبة بالتشكيل من آيات القرآن الكريم للمغفرة والرحمة والهداية وصلاح الدنيا والآخرة.",
    heading: "أدعية قرآنية",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/prophetic-duas",
    section: "duas",
    changefreq: "weekly",
    priority: "0.8",
    title: "أدعية نبوية صحيحة من السنة الشريفة | نور الإيمان",
    description: "أدعية نبوية جامعة ومأثورة عن النبي ﷺ من الصحيحين وكتب السنة الصحيحة لخير الدنيا والآخرة.",
    heading: "أدعية نبوية",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/istighfar-forgiveness",
    section: "duas",
    changefreq: "weekly",
    priority: "0.8",
    title: "أدعية المغفرة والرحمة والاستغفار مكتوبة | نور الإيمان",
    description: "أفضل صيغ وأدعية الاستغفار والتوبة والمغفرة والرحمة من القرآن الكريم والسنة النبوية الصحيحة.",
    heading: "أدعية المغفرة والرحمة",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/relief-and-rizq",
    section: "duas",
    changefreq: "weekly",
    priority: "0.8",
    title: "أدعية الفرج وتفريج الكرب والهم | نور الإيمان",
    description: "أدعية مأثورة صحيحة لتفريج الهم والكرب وقضاء الدين وتيسير الأمور وطلب الفرج القريب.",
    heading: "أدعية تفريج الكرب",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/rizq-and-tawfiq",
    section: "duas",
    changefreq: "weekly",
    priority: "0.8",
    title: "أدعية الرزق والتوفيق والبركة | نور الإيمان",
    description: "أدعية طلب الرزق الحلال الطيب والعلم النافع والتوفيق والبركة في المال والعمل من السنة النبوية.",
    heading: "أدعية الرزق والتوفيق",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/healing-and-wellbeing",
    section: "duas",
    changefreq: "weekly",
    priority: "0.8",
    title: "أدعية الشفاء والعافية والرقية الشرعية | نور الإيمان",
    description: "أدعية الشفاء للمريض وطلب العافية في البدن والسمع والبصر من السنة النبوية الصحيحة.",
    heading: "أدعية الشفاء والعافية",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/family-and-parents",
    section: "duas",
    changefreq: "weekly",
    priority: "0.8",
    title: "أدعية للوالدين والأهل وصلاح الذرية | نور الإيمان",
    description: "أدعية مأثورة من القرآن الكريم والسنة النبوية لبر الوالدين والرحمة بهما وصلاح الزوج والأبناء والذرية.",
    heading: "أدعية الوالدين والأهل",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/daily-worship-duas",
    section: "duas",
    changefreq: "weekly",
    priority: "0.8",
    title: "أدعية اليوم والعبادات والاستخارة والسفر | نور الإيمان",
    description: "الأدعية اليومية المأثورة للمسلم: دعاء الاستخارة، دعاء الخروج من المنزل، دعاء السفر، ودخول المسجد.",
    heading: "أدعية اليوم والعبادات",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
];

const QURAN_DEEP_ROUTES = [
  {
    path: "/quran/1-al-fatiha",
    section: "quran",
    changefreq: "weekly",
    priority: "0.85",
    title: "سورة الفاتحة مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الفاتحة (مكية - 7 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الفاتحة",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/2-al-baqarah",
    section: "quran",
    changefreq: "weekly",
    priority: "0.85",
    title: "سورة البقرة مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة البقرة (مدنية - 286 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة البقرة",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/18-al-kahf",
    section: "quran",
    changefreq: "weekly",
    priority: "0.85",
    title: "سورة الكهف مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الكهف (مكية - 110 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الكهف",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/36-ya-sin",
    section: "quran",
    changefreq: "weekly",
    priority: "0.85",
    title: "سورة يس مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة يس (مكية - 83 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة يس",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/55-ar-rahman",
    section: "quran",
    changefreq: "weekly",
    priority: "0.85",
    title: "سورة الرحمن مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الرحمن (مدنية - 78 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الرحمن",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/56-al-waqia",
    section: "quran",
    changefreq: "weekly",
    priority: "0.85",
    title: "سورة الواقعة مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الواقعة (مكية - 96 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الواقعة",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/67-al-mulk",
    section: "quran",
    changefreq: "weekly",
    priority: "0.85",
    title: "سورة الملك مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الملك (مكية - 30 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الملك",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/112-al-ikhlas",
    section: "quran",
    changefreq: "weekly",
    priority: "0.85",
    title: "سورة الإخلاص مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الإخلاص (مكية - 4 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الإخلاص",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
];

const ALL_SITEMAP_ENTRIES = [
  { path: "/", section: "pages", changefreq: "daily", priority: "1.0" },
  ...PUBLIC_ROUTES,
  ...HADITH_DEEP_ROUTES,
  ...DUA_DEEP_ROUTES,
  ...QURAN_DEEP_ROUTES,
];

const NOINDEX_ROUTES = [
  {
    path: "/favorites",
    title: "مفضلتك | الأذكار والأدعية المحفوظة | نور الإيمان",
    description: "تصفّح الأذكار والأدعية التي حفظتها في مفضلتك لقراءتها والمداومة عليها يومياً.",
  },
  {
    path: "/profile",
    title: "حسابي ونقاطي | نور الإيمان",
    description: "تتبّع نقاطك ودقّة إجاباتك في الاختبارات الدينية على نور الإيمان.",
  },
  {
    path: "/auth",
    title: "تسجيل الدخول | نور الإيمان",
    description: "سجّل دخولك إلى منصة نور الإيمان لحفظ نقاطك وتقدّمك.",
  },
  {
    path: "/admin",
    title: "لوحة التحكم | نور الإيمان",
    description: "إدارة المحتوى والمستخدمين والأسئلة في منصة نور الإيمان.",
  },
];

function buildUrlsetXml(entries) {
  const urlNodes = entries
    .map((entry) => {
      const fullUrl = entry.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${entry.path}`;
      return [
        "  <url>",
        `    <loc>${fullUrl}</loc>`,
        `    <xhtml:link rel="alternate" hreflang="ar" href="${fullUrl}" />`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" />`,
        `    <lastmod>${LASTMOD}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urlNodes,
    "</urlset>",
    "",
  ].join("\n");
}

function buildSitemapIndexXml() {
  const childSitemaps = [
    `${SITE_URL}/sitemap-pages.xml`,
    `${SITE_URL}/sitemap-hadith.xml`,
    `${SITE_URL}/sitemap-duas.xml`,
    `${SITE_URL}/sitemap-quran.xml`,
  ];

  const nodes = childSitemaps
    .map((loc) =>
      [
        "  <sitemap>",
        `    <loc>${loc}</loc>`,
        `    <lastmod>${LASTMOD}</lastmod>`,
        "  </sitemap>",
      ].join("\n")
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    nodes,
    "</sitemapindex>",
    "",
  ].join("\n");
}

function writeSitemapsToDir(targetDir) {
  if (!existsSync(targetDir)) return;

  const mainXml = buildUrlsetXml(ALL_SITEMAP_ENTRIES);
  const indexXml = buildSitemapIndexXml();
  const pagesXml = buildUrlsetXml(ALL_SITEMAP_ENTRIES.filter((e) => e.section === "pages"));
  const hadithXml = buildUrlsetXml([
    ALL_SITEMAP_ENTRIES.find((e) => e.path === "/hadith"),
    ...HADITH_DEEP_ROUTES,
  ]);
  const duasXml = buildUrlsetXml([
    ALL_SITEMAP_ENTRIES.find((e) => e.path === "/duas"),
    ...DUA_DEEP_ROUTES,
  ]);
  const quranXml = buildUrlsetXml([
    ALL_SITEMAP_ENTRIES.find((e) => e.path === "/quran"),
    ...QURAN_DEEP_ROUTES,
  ]);

  writeFileSync(join(targetDir, "sitemap.xml"), mainXml, "utf8");
  writeFileSync(join(targetDir, "sitemap-index.xml"), indexXml, "utf8");
  writeFileSync(join(targetDir, "sitemap-pages.xml"), pagesXml, "utf8");
  writeFileSync(join(targetDir, "sitemap-hadith.xml"), hadithXml, "utf8");
  writeFileSync(join(targetDir, "sitemap-duas.xml"), duasXml, "utf8");
  writeFileSync(join(targetDir, "sitemap-quran.xml"), quranXml, "utf8");
}

function buildRouteHtml(baseHtml, route, indexable = true) {
  const canonicalUrl = `${SITE_URL}${route.canonicalPath ?? route.path}`;
  const robots = indexable
    ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    : "noindex, follow";

  const breadcrumbList = [
    {
      "@type": "ListItem",
      position: 1,
      name: "الرئيسية",
      item: `${SITE_URL}/`,
    },
  ];

  if (route.parent) {
    breadcrumbList.push({
      "@type": "ListItem",
      position: 2,
      name: route.parent.name,
      item: `${SITE_URL}${route.parent.path}`,
    });
    if (route.heading) {
      breadcrumbList.push({
        "@type": "ListItem",
        position: 3,
        name: route.heading,
        item: canonicalUrl,
      });
    }
  } else if (route.heading) {
    breadcrumbList.push({
      "@type": "ListItem",
      position: 2,
      name: route.heading,
      item: canonicalUrl,
    });
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "نور الإيمان",
        alternateName: "منصة نور الإيمان الإسلامية",
        url: `${SITE_URL}/`,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: DEFAULT_IMAGE,
          contentUrl: DEFAULT_IMAGE,
          caption: "نور الإيمان",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "نور الإيمان",
        alternateName: "منصة نور الإيمان الإسلامية",
        url: `${SITE_URL}/`,
        inLanguage: "ar",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#webapp`,
        name: "نور الإيمان",
        url: `${SITE_URL}/`,
        applicationCategory: "EducationalApplication",
        operatingSystem: "All",
        inLanguage: "ar",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        name: route.title,
        description: route.description,
        url: canonicalUrl,
        inLanguage: "ar",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        ...(indexable && breadcrumbList.length > 1
          ? { breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` } }
          : {}),
      },
      ...(indexable && breadcrumbList.length > 1
        ? [
            {
              "@type": "BreadcrumbList",
              "@id": `${canonicalUrl}#breadcrumb`,
              itemListElement: breadcrumbList,
            },
          ]
        : []),
    ],
  };

  let html = baseHtml
    .replace(/<title>.*?<\/title>/s, `<title>${route.title}</title>`)
    .replace(
      /<meta data-rh="true" name="description" content=".*?" \/>/,
      `<meta data-rh="true" name="description" content="${route.description}" />`
    )
    .replace(
      /<meta data-rh="true" name="robots" content=".*?" \/>/,
      `<meta data-rh="true" name="robots" content="${robots}" />`
    )
    .replace(
      /<meta data-rh="true" name="googlebot" content=".*?" \/>/,
      `<meta data-rh="true" name="googlebot" content="${robots}" />`
    )
    .replace(
      /<meta data-rh="true" property="og:url" content=".*?" \/>/,
      `<meta data-rh="true" property="og:url" content="${canonicalUrl}" />`
    )
    .replace(
      /<meta data-rh="true" property="og:title" content=".*?" \/>/,
      `<meta data-rh="true" property="og:title" content="${route.title}" />`
    )
    .replace(
      /<meta data-rh="true" property="og:description" content=".*?" \/>/,
      `<meta data-rh="true" property="og:description" content="${route.description}" />`
    )
    .replace(
      /<meta data-rh="true" name="twitter:title" content=".*?" \/>/,
      `<meta data-rh="true" name="twitter:title" content="${route.title}" />`
    )
    .replace(
      /<meta data-rh="true" name="twitter:description" content=".*?" \/>/,
      `<meta data-rh="true" name="twitter:description" content="${route.description}" />`
    )
    .replace(
      /<script data-rh="true" type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script data-rh="true" type="application/ld+json">${JSON.stringify(schema)}</script>`
    );

  if (indexable) {
    html = html
      .replace(
        /<link data-rh="true" rel="canonical" href=".*?" \/>/,
        `<link data-rh="true" rel="canonical" href="${canonicalUrl}" />`
      )
      .replace(
        /<link data-rh="true" rel="alternate" hreflang="ar" href=".*?" \/>/,
        `<link data-rh="true" rel="alternate" hreflang="ar" href="${canonicalUrl}" />`
      )
      .replace(
        /<link data-rh="true" rel="alternate" hreflang="x-default" href=".*?" \/>/,
        `<link data-rh="true" rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`
      );
  } else {
    // Strip canonical and hreflang alternates on noindex routes to prevent contradictory crawler signals
    html = html
      .replace(/\s*<link data-rh="true" rel="canonical" href=".*?" \/>/, "")
      .replace(/\s*<link data-rh="true" rel="alternate" hreflang="ar" href=".*?" \/>/, "")
      .replace(/\s*<link data-rh="true" rel="alternate" hreflang="x-default" href=".*?" \/>/, "");
  }

  if (route.keywords) {
    html = html.replace(
      /<meta data-rh="true" name="keywords" content=".*?" \/>/,
      `<meta data-rh="true" name="keywords" content="${route.keywords}" />`
    );
  }

  if (route.heading) {
    html = html
      .replace(
        /<h1>.*?<\/h1>/,
        `<h1>${route.heading} — نور الإيمان</h1>`
      )
      .replace(
        /<p>منصة إسلامية متكاملة.*?<\/p>/,
        `<p>${route.description}</p>`
      );
  }

  return html;
}

// Always keep public/ sitemaps synchronized
writeSitemapsToDir(PUBLIC_DIR);

if (existsSync(BASE_HTML_PATH)) {
  writeSitemapsToDir(DIST_DIR);

  const baseHtml = readFileSync(BASE_HTML_PATH, "utf8");
  const allIndexableSubroutes = [
    ...PUBLIC_ROUTES,
    ...HADITH_DEEP_ROUTES,
    ...DUA_DEEP_ROUTES,
    ...QURAN_DEEP_ROUTES,
  ];

  for (const route of allIndexableSubroutes) {
    const outPath = join(DIST_DIR, route.path.slice(1), "index.html");
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, buildRouteHtml(baseHtml, route, true), "utf8");
  }

  for (const route of NOINDEX_ROUTES) {
    const outPath = join(DIST_DIR, route.path.slice(1), "index.html");
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, buildRouteHtml(baseHtml, route, false), "utf8");
  }

  // Generate 404.html with noindex and without canonical link
  const notFoundHtml = buildRouteHtml(
    baseHtml,
    {
      path: "/404",
      title: "الصفحة غير موجودة | نور الإيمان",
      description: "هذه الصفحة غير موجودة، يمكنك العودة إلى الصفحة الرئيسية لمنصة نور الإيمان.",
      heading: "الصفحة غير موجودة (404)",
    },
    false
  );
  writeFileSync(join(DIST_DIR, "404.html"), notFoundHtml, "utf8");
}
