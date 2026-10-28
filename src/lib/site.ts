export const SITE_URL = "https://al-noor-quest.lovable.app";

export const PUBLIC_PATHS = ["/", "/morning", "/evening", "/duas", "/quran", "/tasbih", "/quiz"];

export function isIndexablePath(path: string) {
  return PUBLIC_PATHS.includes(path);
}