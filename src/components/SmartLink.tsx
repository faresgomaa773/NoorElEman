import { useEffect, useRef } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { prefetchRoute } from "@/lib/route-prefetch";

interface SmartLinkProps extends LinkProps {
  /** Prefetch the route chunk once this link scrolls into view. Default: true */
  prefetchOnVisible?: boolean;
}

/**
 * Drop-in replacement for react-router <Link/> that prefetches the
 * lazy-loaded route chunk on hover, focus, touchstart, or when the
 * link enters the viewport — making navigation feel instant while
 * keeping the initial bundle small.
 */
export function SmartLink({ to, prefetchOnVisible = true, ...rest }: SmartLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const path = typeof to === "string" ? to : to.pathname ?? "";

  useEffect(() => {
    if (!prefetchOnVisible || !ref.current || !path) return;
    if (typeof IntersectionObserver === "undefined") return;

    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            prefetchRoute(path);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [path, prefetchOnVisible]);

  const handlePrefetch = () => prefetchRoute(path);

  return (
    <Link
      ref={ref}
      to={to}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch}
      {...rest}
    />
  );
}
