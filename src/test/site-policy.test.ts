import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  PUBLIC_PATHS,
  ROUTE_SEO_META,
  SITEMAP_FILES,
  SITEMAP_PATHS,
  SITE_URL,
  createSurahSlug,
  getCanonicalUrl,
  getDuaCategorySlug,
  getHadithCategorySlug,
  isIndexablePath,
  normalizePath,
  parseSurahNumberFromSlug,
} from "../lib/site";
import { allowsBackgroundPrefetch } from "../lib/prefetch-policy";

describe("Public discovery & Google Search Console indexing policy", () => {
  it("lists all indexable public routes and deep categories in sitemap.xml on the canonical origin", () => {
    const xml = readFileSync("public/sitemap.xml", "utf8");
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(urls.sort()).toEqual(SITEMAP_PATHS.map((path) => getCanonicalUrl(path)).sort());
    expect(SITE_URL).toBe("https://al-noor-quest.lovable.app");
  });

  it("maintains synchronized modular sitemaps and sitemap-index.xml", () => {
    const indexXml = readFileSync("public/sitemap-index.xml", "utf8");
    const indexLocs = [...indexXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(indexLocs).toEqual([
      `${SITE_URL}/sitemap-pages.xml`,
      `${SITE_URL}/sitemap-hadith.xml`,
      `${SITE_URL}/sitemap-duas.xml`,
      `${SITE_URL}/sitemap-quran.xml`,
    ]);

    for (const file of SITEMAP_FILES) {
      const content = readFileSync(`public/${file}`, "utf8");
      expect(content).toContain(SITE_URL);
      expect(content).not.toContain("/auth");
      expect(content).not.toContain("/admin");
      expect(content).not.toContain("/profile");
      expect(content).not.toContain("/favorites");
    }
  });

  it("does not index removed or private pages", () => {
    for (const path of ["/qibla", "/prayer-times", "/auth", "/admin", "/profile", "/favorites", "/missing"]) {
      expect(isIndexablePath(path)).toBe(false);
    }
    expect(isIndexablePath("/quran")).toBe(true);
    expect(isIndexablePath("/hadith")).toBe(true);
  });

  it("supports descriptive URLs for Quran surahs, Dua categories, Hadith collections, and route aliases", () => {
    expect(createSurahSlug(18, "Al-Kahf")).toBe("18-al-kahf");
    expect(parseSurahNumberFromSlug("18-al-kahf")).toBe(18);
    expect(parseSurahNumberFromSlug("999-invalid")).toBeNull();

    expect(isIndexablePath("/quran/18-al-kahf")).toBe(true);
    expect(isIndexablePath("/quran/114-an-nas")).toBe(true);
    expect(isIndexablePath("/quran/999-unknown")).toBe(false);

    expect(getDuaCategorySlug("أدعية الفرج والرزق")).toBe("relief-and-rizq");
    expect(getDuaCategorySlug("أدعية اليوم والعبادات")).toBe("daily-worship-duas");
    expect(isIndexablePath("/duas/relief-and-rizq")).toBe(true);
    expect(isIndexablePath("/duas/daily-worship-duas")).toBe(true);
    expect(isIndexablePath("/duas/unknown-category")).toBe(false);

    expect(getHadithCategorySlug("bukhari")).toBe("sahih-al-bukhari");
    expect(isIndexablePath("/hadith/sahih-al-bukhari")).toBe(true);
    expect(isIndexablePath("/hadith/al-arbaun-an-nawawiyyah")).toBe(true);
    expect(isIndexablePath("/hadith/unknown-book")).toBe(false);

    expect(normalizePath("/azkar-al-sabah")).toBe("/morning");
    expect(normalizePath("/azkar-al-masaa")).toBe("/evening");
    expect(normalizePath("/ahadith")).toBe("/hadith");
    expect(getCanonicalUrl("/azkar-al-sabah")).toBe("https://al-noor-quest.lovable.app/morning");
    expect(getCanonicalUrl("/quran/18-al-kahf/")).toBe("https://al-noor-quest.lovable.app/quran/18-al-kahf");
  });

  it("normalizes trailing slashes and query parameters so public routes are never marked noindex", () => {
    expect(normalizePath("/morning/")).toBe("/morning");
    expect(normalizePath("/morning/?utm_source=gsc")).toBe("/morning");
    expect(normalizePath("/")).toBe("/");
    expect(isIndexablePath("/morning/")).toBe(true);
    expect(isIndexablePath("/duas/")).toBe(true);
    expect(isIndexablePath("/hadith/")).toBe(true);
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
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap-index.xml`);
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

describe("Security hardening & RBAC policy", () => {
  it("hashes passwords and never stores plaintext passwords in localStorage", async () => {
    localStorage.clear();
    const { supabase, hashPasswordSync } = await import("../integrations/supabase/client");

    const plainPass = "MySuperSecretPass#2026";
    const email = "securitytest@example.com";
    await supabase.auth.signUp({
      email,
      password: plainPass,
      options: { data: { display_name: "فحص أمني" } },
    });

    const rawAccounts = localStorage.getItem("al_noor_local_db_accounts") || "";
    expect(rawAccounts).not.toContain(plainPass);
    expect(rawAccounts).toContain(hashPasswordSync(plainPass, email));

    // Non-admin user cannot call admin_get_questions or insert into azkar
    const adminRpcRes = await supabase.rpc("admin_get_questions");
    expect(adminRpcRes.error).not.toBeNull();
    expect(adminRpcRes.data).toBeNull();

    const insertRes = await supabase.from("azkar").insert({
      text: "محاولة غير مصرحة",
      category: "morning",
      repeat_count: 1,
    });
    expect(insertRes.error).not.toBeNull();
  });

  it("enforces HTTP security headers in _headers and netlify.toml", () => {
    const headersFile = readFileSync("public/_headers", "utf8");
    const netlifyToml = readFileSync("netlify.toml", "utf8");

    expect(headersFile).toContain("X-Content-Type-Options: nosniff");
    expect(headersFile).toContain("Referrer-Policy: strict-origin-when-cross-origin");
    expect(headersFile).toContain("Strict-Transport-Security:");
    expect(netlifyToml).toContain('X-Content-Type-Options = "nosniff"');
  });
});