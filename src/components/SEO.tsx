import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import {
  SITE_URL,
  PUBLIC_PATHS,
  ROUTE_SEO_META,
  HOME_FAQS,
  type FaqItem,
  getCanonicalUrl,
  isIndexablePath,
  normalizePath,
} from "@/lib/site";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  noindex?: boolean;
  faqs?: FaqItem[];
}

const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/08546d39-2455-4a48-b81e-8ff8a037e911/id-preview-cfd3ae0f--3668b397-3abf-47a0-8c92-b6878c69e5eb.lovable.app-1776933579072.png";

/**
 * Per-route SEO manager under HelmetProvider.
 * Updates <title>, meta description/keywords, robots policy, Open Graph,
 * Twitter card, canonical/hreflang links, and rich Schema.org JSON-LD (@graph).
 */
export function SEO({ title, description, keywords, image, noindex, faqs }: SEOProps) {
  const { pathname } = useLocation();
  const normalizedPath = normalizePath(pathname);
  const routeMeta = ROUTE_SEO_META[normalizedPath];

  const finalTitle = title || routeMeta?.title || ROUTE_SEO_META["/"].title;
  const finalDescription =
    description || routeMeta?.description || ROUTE_SEO_META["/"].description;
  const finalKeywords = keywords ?? routeMeta?.keywords ?? ROUTE_SEO_META["/"].keywords;

  const indexable = !noindex && isIndexablePath(normalizedPath);
  const robotsDirective = indexable
    ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    : "noindex, follow";

  const canonicalUrl = getCanonicalUrl(normalizedPath);
  const img = image ?? DEFAULT_IMAGE;
  const pageFaqs = faqs ?? (normalizedPath === "/" ? HOME_FAQS : undefined);

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "الرئيسية",
      item: `${SITE_URL}/`,
    },
  ];

  if (normalizedPath !== "/" && routeMeta) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: routeMeta.heading,
      item: canonicalUrl,
    });
  }

  const siteNavigationItemList =
    normalizedPath === "/"
      ? {
          "@type": "ItemList",
          "@id": `${SITE_URL}/#navigation`,
          name: "أقسام منصة نور الإيمان",
          itemListElement: PUBLIC_PATHS.filter((p) => p !== "/").map((p, idx) => ({
            "@type": "SiteNavigationElement",
            position: idx + 1,
            name: ROUTE_SEO_META[p]?.heading ?? p,
            description: ROUTE_SEO_META[p]?.description ?? "",
            url: `${SITE_URL}${p}`,
          })),
        }
      : null;

  const faqSchema =
    pageFaqs && pageFaqs.length > 0
      ? {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faq`,
          mainEntity: pageFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "نور الإيمان",
        alternateName: "منصة نور الإيمان الإسلامية",
        url: `${SITE_URL}/`,
        inLanguage: "ar",
        description: ROUTE_SEO_META["/"].description,
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#webapp`,
        name: "نور الإيمان",
        url: `${SITE_URL}/`,
        applicationCategory: "EducationalApplication",
        operatingSystem: "All",
        inLanguage: "ar",
        description: ROUTE_SEO_META["/"].description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        name: finalTitle,
        description: finalDescription,
        url: canonicalUrl,
        inLanguage: "ar",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
      },
      ...(siteNavigationItemList ? [siteNavigationItemList] : []),
      ...(breadcrumbItems.length > 1
        ? [
            {
              "@type": "BreadcrumbList",
              "@id": `${canonicalUrl}#breadcrumb`,
              itemListElement: breadcrumbItems,
            },
          ]
        : []),
      ...(faqSchema ? [faqSchema] : []),
    ],
  };

  return (
    <Helmet prioritizeSeoTags>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={robotsDirective} />
      <meta name="googlebot" content={robotsDirective} />

      <link rel="canonical" href={canonicalUrl} />
      {indexable && <link rel="alternate" hrefLang="ar" href={canonicalUrl} />}
      {indexable && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={img} />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="ar_AR" />
      <meta property="og:site_name" content="نور الإيمان" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:image:alt" content={finalTitle} />

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
