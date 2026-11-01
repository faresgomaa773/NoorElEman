// Smart route prefetching: dynamic-imports each lazy route on demand.
// Dynamic imports warm the browser module cache while routes remain lazy.
import { allowsBackgroundPrefetch } from "./prefetch-policy";
import { normalizePath } from "./site";

type Loader = () => Promise<unknown>;

const loaders: Record<string, Loader> = {
  "/morning": () => import("@/pages/Morning.tsx"),
  "/evening": () => import("@/pages/Evening.tsx"),
  "/duas": () => import("@/pages/Duas.tsx"),
  "/favorites": () => import("@/pages/Favorites.tsx"),
  "/tasbih": () => import("@/pages/Tasbih.tsx"),
  "/quran": () => import("@/pages/Quran.tsx"),
  "/quiz": () => import("@/pages/Quiz.tsx"),
  "/profile": () => import("@/pages/Profile.tsx"),
  "/auth": () => import("@/pages/Auth.tsx"),
};

const prefetched = new Set<string>();

function resolveLoaderKey(path: string): string {
  const normalized = normalizePath(path);
  if (normalized.startsWith("/quran/")) return "/quran";
  if (normalized.startsWith("/duas/")) return "/duas";
  return normalized;
}

export function prefetchRoute(path: string) {
  if (
    typeof navigator !== "undefined" &&
    !allowsBackgroundPrefetch(
      (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    )
  )
    return;
  const key = resolveLoaderKey(path);
  if (prefetched.has(key)) return;
  const loader = loaders[key];
  if (!loader) return;
  prefetched.add(key);
  // Fire and forget — chunk gets cached by the browser
  loader().catch(() => prefetched.delete(key));
}

/** Prefetch a small set of high-priority routes when the browser is idle. */
export function prefetchPriorityRoutes(paths: string[] = ["/morning", "/evening", "/duas", "/quran"]) {
  if (typeof window === "undefined") return () => {};
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const run = () =>
    paths.forEach((path, index) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) prefetchRoute(path);
        }, index * 350)
      );
    });
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
    .requestIdleCallback;
  if (typeof ric === "function") {
    const id = ric(run, { timeout: 2500 });
    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(id);
      timers.forEach(clearTimeout);
    };
  } else {
    timers.push(setTimeout(run, 1500));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }
}
