import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const SITE_URL = "https://al-noor-quest.lovable.app";
const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/08546d39-2455-4a48-b81e-8ff8a037e911/id-preview-cfd3ae0f--3668b397-3abf-47a0-8c92-b6878c69e5eb.lovable.app-1776933579072.png";
const DIST_DIR = join(process.cwd(), "dist");
const BASE_HTML_PATH = join(DIST_DIR, "index.html");

const PUBLIC_ROUTES = [
  {
    path: "/morning",
    title: "أذكار الصباح مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "اقرأ أذكار الصباح مكتوبة كاملة بالتشكيل من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وبيان فضل كل ذكر ومصدره.",
    keywords:
      "أذكار الصباح, اذكار الصباح مكتوبة, أذكار الصباح كاملة, دعاء الصباح, حصن المسلم أذكار الصباح, اذكار الصباح بالتشكيل, نور الإيمان",
    heading: "أذكار الصباح",
  },
  {
    path: "/evening",
    title: "أذكار المساء مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "اقرأ أذكار المساء مكتوبة كاملة بالتشكيل من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وبيان فضل كل ذكر ومصدره.",
    keywords:
      "أذكار المساء, اذكار المساء مكتوبة, أذكار المساء كاملة, دعاء المساء, حصن المسلم أذكار المساء, اذكار المساء بالتشكيل, نور الإيمان",
    heading: "أذكار المساء",
  },
  {
    path: "/duas",
    title: "الأدعية المأثورة من القرآن والسنة النبوية | نور الإيمان",
    description:
      "مجموعة شاملة ومصنّفة من الأدعية المأثورة الصحيحة من القرآن الكريم والسنة النبوية الشريفة للفرج والرزق والشفاء والاستغفار والهداية.",
    keywords:
      "أدعية, دعاء, أدعية مأثورة, دعاء من القرآن, دعاء من السنة, أدعية الفرج والرزق, دعاء الشفاء, نور الإيمان",
    heading: "الأدعية المأثورة",
  },
  {
    path: "/hadith",
    title: "الأحاديث النبوية الشريفة الصحيحة مع الشرح | نور الإيمان",
    description:
      "تصفّح الأحاديث النبوية الشريفة الصحيحة من الأربعين النووية والصحيحين (البخاري ومسلم) مكتوبة بالتشكيل مع بيان الراوي والمصدر وشرح الفوائد المستفادة.",
    keywords:
      "الأحاديث النبوية, أحاديث صحيحة, الأربعون النووية, أحاديث البخاري ومسلم, جوامع الكلم, حديث شريف مع الشرح, السنة النبوية, نور الإيمان",
    heading: "الأحاديث النبوية الشريفة",
  },
  {
    path: "/quran",
    title: "القرآن الكريم كاملاً بالرسم العثماني مع التلاوة | نور الإيمان",
    description:
      "تصفّح القرآن الكريم كاملاً بالرسم العثماني برواية حفص عن عاصم مع تلاوات صوتية لمشاهير القراء ووضع القراءة الليلي المريح للعين.",
    keywords:
      "القرآن الكريم, قراءة القرآن, مصحف, الرسم العثماني, تلاوة القرآن, سور القرآن, استماع القرآن الكريم, نور الإيمان",
    heading: "القرآن الكريم",
  },
  {
    path: "/tasbih",
    title: "السبحة الإلكترونية | عدّاد التسبيح والاستغفار | نور الإيمان",
    description:
      "سبحة إلكترونية تفاعلية تساعدك على المداومة على التسبيح والتحميد والتكبير والاستغفار والصلاة على النبي مع حفظ مجموع تسبيحاتك اليومية.",
    keywords:
      "السبحة الإلكترونية, سبحة الكترونية, تسبيح, عداد التسبيح, استغفار, ذكر الله, سبحان الله وبحمده, نور الإيمان",
    heading: "السبحة الإلكترونية",
  },
  {
    path: "/quiz",
    title: "اختبارات دينية تفاعلية | اختبر معلوماتك الإسلامية | نور الإيمان",
    description:
      "اختبارات دينية تفاعلية وأسئلة إسلامية في القرآن الكريم والسيرة النبوية والفقه والعقيدة مع تصحيح فوري وشرح مفصّل للإجابات.",
    keywords:
      "اختبارات دينية, أسئلة إسلامية, مسابقات دينية, اختبر معلوماتك الدينية, أسئلة في القرآن والسيرة, نور الإيمان",
    heading: "الاختبار الديني",
  },
];

const DESCRIPTIVE_DEEP_ROUTES = [
  {
    path: "/quran/1-al-fatiha",
    title: "سورة الفاتحة مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الفاتحة (مكية - 7 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الفاتحة",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/2-al-baqarah",
    title: "سورة البقرة مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة البقرة (مدنية - 286 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة البقرة",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/18-al-kahf",
    title: "سورة الكهف مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الكهف (مكية - 110 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الكهف",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/36-ya-sin",
    title: "سورة يس مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة يس (مكية - 83 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة يس",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/55-ar-rahman",
    title: "سورة الرحمن مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الرحمن (مدنية - 78 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الرحمن",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/56-al-waqia",
    title: "سورة الواقعة مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الواقعة (مكية - 96 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الواقعة",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/67-al-mulk",
    title: "سورة الملك مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الملك (مكية - 30 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الملك",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/quran/112-al-ikhlas",
    title: "سورة الإخلاص مكتوبة كاملة بالرسم العثماني مع التلاوة | نور الإيمان",
    description: "اقرأ واستمع إلى سورة الإخلاص (مكية - 4 آية) مكتوبة كاملة بالرسم العثماني برواية حفص عن عاصم مع تلاوة لأشهر القراء.",
    heading: "سورة الإخلاص",
    parent: { name: "القرآن الكريم", path: "/quran" },
  },
  {
    path: "/duas/quranic-duas",
    title: "أدعية قرآنية مكتوبة من القرآن الكريم | نور الإيمان",
    description: "جوامع الأدعية القرآنية المباركة المكتوبة بالتشكيل من آيات القرآن الكريم للمغفرة والرحمة والهداية وصلاح الدنيا والآخرة.",
    heading: "أدعية قرآنية",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/prophetic-duas",
    title: "أدعية نبوية صحيحة من السنة الشريفة | نور الإيمان",
    description: "أدعية نبوية جامعة ومأثورة عن النبي ﷺ من الصحيحين وكتب السنة الصحيحة لخير الدنيا والآخرة.",
    heading: "أدعية نبوية",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/istighfar-forgiveness",
    title: "أدعية المغفرة والرحمة والاستغفار مكتوبة | نور الإيمان",
    description: "أفضل صيغ وأدعية الاستغفار والتوبة والمغفرة والرحمة من القرآن الكريم والسنة النبوية الصحيحة.",
    heading: "أدعية المغفرة والرحمة",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/relief-and-rizq",
    title: "أدعية الفرج وتفريج الكرب والهم | نور الإيمان",
    description: "أدعية مأثورة صحيحة لتفريج الهم والكرب وقضاء الدين وتيسير الأمور وطلب الفرج القريب.",
    heading: "أدعية تفريج الكرب",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/rizq-and-tawfiq",
    title: "أدعية الرزق والتوفيق والبركة | نور الإيمان",
    description: "أدعية طلب الرزق الحلال الطيب والعلم النافع والتوفيق والبركة في المال والعمل من السنة النبوية.",
    heading: "أدعية الرزق والتوفيق",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
  {
    path: "/duas/healing-and-wellbeing",
    title: "أدعية الشفاء والعافية والرقية الشرعية | نور الإيمان",
    description: "أدعية الشفاء للمريض وطلب العافية في البدن والسمع والبصر من السنة النبوية الصحيحة.",
    heading: "أدعية الشفاء والعافية",
    parent: { name: "الأدعية المأثورة", path: "/duas" },
  },
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

if (existsSync(BASE_HTML_PATH)) {
  const baseHtml = readFileSync(BASE_HTML_PATH, "utf8");

  for (const route of [...PUBLIC_ROUTES, ...DESCRIPTIVE_DEEP_ROUTES]) {
    const outPath = join(DIST_DIR, route.path.slice(1), "index.html");
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, buildRouteHtml(baseHtml, route, true), "utf8");
  }

  for (const route of NOINDEX_ROUTES) {
    const outPath = join(DIST_DIR, route.path.slice(1), "index.html");
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, buildRouteHtml(baseHtml, route, false), "utf8");
  }

  // Generate 404.html with noindex
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

