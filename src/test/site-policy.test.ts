import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PUBLIC_PATHS, SITE_URL, isIndexablePath } from "../lib/site";
import { allowsBackgroundPrefetch } from "../lib/prefetch-policy";

describe("Public discovery", () => {
  it("lists only actual public routes in the sitemap on the canonical origin", () => {
    const xml = readFileSync("public/sitemap.xml", "utf8");
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(urls.sort()).toEqual(PUBLIC_PATHS.map((path) => `${SITE_URL}${path}`).sort());
    expect(SITE_URL).toBe("https://al-noor-quest.lovable.app");
  });
  it("does not index removed or private pages", () => {
    for (const path of ["/qibla", "/prayer-times", "/auth", "/admin", "/profile", "/missing"]) {
      expect(isIndexablePath(path)).toBe(false);
    }
    expect(isIndexablePath("/quran")).toBe(true);
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