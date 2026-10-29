import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  PUBLIC_PATHS,
  ROUTE_SEO_META,
  SITE_URL,
  getCanonicalUrl,
  isIndexablePath,
  normalizePath,
} from "../lib/site";
import { allowsBackgroundPrefetch } from "../lib/prefetch-policy";

describe("Public discovery & Google Search Console indexing policy", () => {
  it("lists only actual public routes in the sitemap on the canonical origin", () => {
    const xml = readFileSync("public/sitemap.xml", "utf8");
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(urls.sort()).toEqual(PUBLIC_PATHS.map((path) => `${SITE_URL}${path}`).sort());
    expect(SITE_URL).toBe("https://al-noor-quest.lovable.app");
  });

  it("does not index removed or private pages", () => {
    for (const path of ["/qibla", "/prayer-times", "/auth", "/admin", "/profile", "/favorites", "/missing"]) {
      expect(isIndexablePath(path)).toBe(false);
    }
    expect(isIndexablePath("/quran")).toBe(true);
  });

  it("normalizes trailing slashes and query parameters so public routes are never marked noindex", () => {
    expect(normalizePath("/morning/")).toBe("/morning");
    expect(normalizePath("/morning/?utm_source=gsc")).toBe("/morning");
    expect(normalizePath("/")).toBe("/");
    expect(isIndexablePath("/morning/")).toBe(true);
    expect(isIndexablePath("/duas/")).toBe(true);
    expect(getCanonicalUrl("/morning/")).toBe("https://al-noor-quest.lovable.app/morning");
    expect(getCanonicalUrl("/")).toBe("https://al-noor-quest.lovable.app/");
  });

  it("provides dedicated SEO metadata for every indexable public route", () => {
    for (const path of PUBLIC_PATHS) {
      const meta = ROUTE_SEO_META[path];
      expect(meta).toBeDefined();
      expect(meta.title.length).toBeGreaterThan(15);
      expect(meta.description.length).toBeGreaterThan(50);
    }
  });

  it("keeps robots.txt clean and aligned with sitemap and private routes", () => {
    const robots = readFileSync("public/robots.txt", "utf8");
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /auth");
    expect(robots).toContain("Disallow: /profile");
    expect(robots).toContain("Disallow: /favorites");
    expect(robots).not.toContain("Host:");
  });
});

describe("Speculative loading", () => {
  it("respects data saving", () => {
    expect(allowsBackgroundPrefetch({ saveData: true, effectiveType: "4g" })).toBe(false);
  });
  it("avoids slow connections while allowing normal connections", () => {
    for (const effectiveType of ["slow-2g", "2g", "3g"]) expect(allowsBackgroundPrefetch({ effectiveType })).toBe(false);
    expect(allowsBackgroundPrefetch({ effectiveType: "4g" })).toBe(true);
    expect(allowsBackgroundPrefetch()).toBe(true);
  });
});