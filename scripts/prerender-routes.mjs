import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const SITE_URL = "https://al-noor-quest.lovable.app";
const DIST_DIR = join(process.cwd(), "dist");
const BASE_HTML_PATH = join(DIST_DIR, "index.html");

const PUBLIC_ROUTES = [
  {
    path: "/morning",
    title: "أذكار الصباح مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "أذكار الصباح المباركة مكتوبة كاملة من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وفضل كل ذكر.",
    keywords:
      "أذكار الصباح, اذكار الصباح مكتوبة, دعاء الصباح, حصن المسلم أذكار الصباح, نور الإيمان",
    heading: "أذكار الصباح",
  },
  {
    path: "/evening",
    title: "أذكار المساء مكتوبة كاملة من حصن المسلم | نور الإيمان",
    description:
      "أذكار المساء المباركة مكتوبة كاملة من القرآن الكريم والسنة النبوية الصحيحة (حصن المسلم) مع عدّاد التكرار التفاعلي وفضل كل ذكر.",
    keywords:
      "أذكار المساء, اذكار المساء مكتوبة, دعاء المساء, حصن المسلم أذكار المساء, نور الإيمان",
    heading: "أذكار المساء",
  },
  {
    path: "/duas",
    title: "الأدعية المأثورة من القرآن والسنة النبوية | نور الإيمان",
    description:
      "مجموعة شاملة ومصنّفة من الأدعية المأثورة الصحيحة من القرآن الكريم والسنة النبوية الشريفة للفرج والرزق والشفاء والاستغفار.",
    keywords:
      "أدعية, دعاء, أدعية مأثورة, دعاء من القرآن, دعاء من السنة, أدعية الفرج والرزق, نور الإيمان",
    heading: "الأدعية المأثورة",
  },
  {
    path: "/quran",
    title: "القرآن الكريم كاملاً بالرسم العثماني مع التلاوة | نور الإيمان",
    description:
      "القرآن الكريم كاملاً بالرسم العثماني مع تلاوات صوتية لمشاهير القراء، قراءة واستماع لجميع سور القرآن الكريم بسهولة مع وضع القراءة المريح للعين.",
    keywords:
      "القرآن الكريم, قراءة القرآن, مصحف, الرسم العثماني, تلاوة القرآن, سور القرآن, نور الإيمان",
    heading: "القرآن الكريم",
  },
  {
    path: "/tasbih",
    title: "السبحة الإلكترونية | عدّاد التسبيح والاستغفار | نور الإيمان",
    description:
      "سبحة إلكترونية تفاعلية تساعدك على المداومة على التسبيح والتحميد والتكبير والاستغفار مع حفظ مجموع تسبيحاتك اليومية.",
    keywords:
      "السبحة الإلكترونية, تسبيح, عداد التسبيح, استغفار, ذكر الله, نور الإيمان",
    heading: "السبحة الإلكترونية",
  },
  {
    path: "/quiz",
    title: "اختبارات دينية تفاعلية | اختبر معلوماتك الإسلامية | نور الإيمان",
    description:
      "اختبارات دينية تفاعلية وأسئلة إسلامية في القرآن الكريم والسيرة النبوية والفقه مع تصحيح فوري وشرح للإجابات.",
    keywords:
      "اختبارات دينية, أسئلة إسلامية, مسابقات دينية, اختبر معلوماتك الدينية, نور الإيمان",
    heading: "الاختبار الديني",
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
  const canonicalUrl = `${SITE_URL}${route.path}`;
  const robots = indexable
    ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    : "noindex, follow";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "نور الإيمان",
        url: `${SITE_URL}/`,
        inLanguage: "ar",
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        name: route.title,
        description: route.description,
        url: canonicalUrl,
        inLanguage: "ar",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      ...(indexable && route.heading
        ? [
            {
              "@type": "BreadcrumbList",
              "@id": `${canonicalUrl}#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "الرئيسية",
                  item: `${SITE_URL}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: route.heading,
                  item: canonicalUrl,
                },
              ],
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

  for (const route of PUBLIC_ROUTES) {
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
