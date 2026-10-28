import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SITE_URL, isIndexablePath } from "@/lib/site";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/08546d39-2455-4a48-b81e-8ff8a037e911/id-preview-cfd3ae0f--3668b397-3abf-47a0-8c92-b6878c69e5eb.lovable.app-1776933579072.png";

/**
 * Lightweight per-page SEO. Updates <title>, meta description/keywords,
 * Open Graph, Twitter card, canonical URL, and JSON-LD WebPage schema.
 */
export function SEO({ title, description, keywords, image }: SEOProps) {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${pathname}`;
  const img = image ?? DEFAULT_IMAGE;

  const schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url,
      inLanguage: "ar",
      isPartOf: {
        "@type": "WebSite",
        name: "نور الإيمان",
        url: SITE_URL,
      },
    };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords ?? ""} />
      <meta name="robots" content={isIndexablePath(pathname) ? "index, follow" : "noindex, follow"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={url} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
