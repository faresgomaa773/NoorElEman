import { Link } from "react-router-dom";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbCrumb {
  label: string;
  to?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbCrumb[];
  className?: string;
  variant?: "hero" | "default";
}

export function PageBreadcrumb({
  items,
  className,
  variant = "hero",
}: PageBreadcrumbProps) {
  return (
    <nav
      aria-label="مسار التنقل"
      className={cn(
        "flex items-center justify-center flex-wrap gap-1.5 text-xs sm:text-sm mb-4",
        variant === "hero"
          ? "text-primary-foreground/80"
          : "text-muted-foreground",
        className
      )}
    >
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className="inline-flex items-center flex-wrap gap-1.5"
      >
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
          className="inline-flex items-center gap-1"
        >
          <Link
            to="/"
            itemProp="item"
            className={cn(
              "inline-flex items-center gap-1 transition-colors hover:underline underline-offset-4",
              variant === "hero"
                ? "hover:text-primary-foreground"
                : "hover:text-primary"
            )}
          >
            <Home className="h-3.5 w-3.5" />
            <span itemProp="name">الرئيسية</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {items.map((crumb, idx) => {
          const position = idx + 2;
          const isLast = idx === items.length - 1;
          return (
            <li
              key={`${crumb.label}-${position}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  itemProp="item"
                  className={cn(
                    "transition-colors hover:underline underline-offset-4",
                    variant === "hero"
                      ? "hover:text-primary-foreground"
                      : "hover:text-primary"
                  )}
                >
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              ) : (
                <span
                  itemProp="name"
                  aria-current="page"
                  className={cn(
                    "font-semibold",
                    variant === "hero"
                      ? "text-accent"
                      : "text-foreground"
                  )}
                >
                  {crumb.label}
                </span>
              )}
              <meta itemProp="position" content={String(position)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
