import { BookOpen, Eye, Minus, Plus, RotateCcw, Moon, Sun, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BG_THEME_OPTIONS,
  FONT_SIZE_LABELS,
  FONT_SIZE_ORDER,
  type ReadingBgTheme,
  type ReadingFontSize,
  type ReadingSettings,
} from "@/hooks/useReadingSettings";
import { cn } from "@/lib/utils";

interface ReadingModeToolbarProps {
  settings: ReadingSettings;
  onToggleReadingMode: () => void;
  onToggleNightMode: () => void;
  onSetFontSize: (size: ReadingFontSize) => void;
  onStepFontSize: (delta: number) => void;
  onSetBgTheme: (theme: ReadingBgTheme) => void;
  onReset: () => void;
  className?: string;
}

export function ReadingModeToolbar({
  settings,
  onToggleReadingMode,
  onToggleNightMode,
  onSetFontSize,
  onStepFontSize,
  onSetBgTheme,
  onReset,
  className,
}: ReadingModeToolbarProps) {
  const { readingMode, fontSize, bgTheme, nightMode } = settings;
  const fontIdx = FONT_SIZE_ORDER.indexOf(fontSize);

  return (
    <div
      role="region"
      aria-label="إعدادات وضع القراءة"
      className={cn(
        "rounded-2xl border transition-colors duration-200 p-3.5 sm:p-4 mb-6",
        nightMode
          ? "bg-[#17221E] border-[#283932] text-[#EAE3D2]"
          : "bg-card border-border text-foreground shadow-soft",
        className
      )}
    >
      {/* Top primary row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            size="sm"
            variant={readingMode ? "emerald" : "outline"}
            onClick={onToggleReadingMode}
            aria-pressed={readingMode}
            className="gap-2 whitespace-nowrap shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            <span>وضع القراءة</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant={nightMode ? "gold" : "outline"}
            onClick={onToggleNightMode}
            aria-pressed={nightMode}
            aria-label="تفعيل وضع الراحة للعين"
            className={cn(
              "gap-2 whitespace-nowrap shrink-0",
              nightMode && "bg-[#D4AF37] text-[#141A17] hover:bg-[#DFBE4F]"
            )}
          >
            {nightMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>راحة العين (الوضع الليلي)</span>
          </Button>
        </div>

        {/* Quick Font Step & Reset */}
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "inline-flex items-center rounded-xl border p-1 gap-1",
              nightMode ? "border-[#283932] bg-[#101815]" : "border-border bg-muted/40"
            )}
          >
            <button
              type="button"
              onClick={() => onStepFontSize(-1)}
              disabled={fontIdx <= 0}
              aria-label="تصغير الخط"
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-40",
                nightMode ? "hover:bg-[#1E2D27] text-[#EAE3D2]" : "hover:bg-background text-foreground"
              )}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span
              className={cn(
                "px-2 text-xs font-medium whitespace-nowrap select-none",
                nightMode ? "text-[#EAE3D2]" : "text-foreground"
              )}
            >
              الخط: {FONT_SIZE_LABELS[fontSize]}
            </span>
            <button
              type="button"
              onClick={() => onStepFontSize(1)}
              disabled={fontIdx >= FONT_SIZE_ORDER.length - 1}
              aria-label="تكبير الخط"
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-40",
                nightMode ? "hover:bg-[#1E2D27] text-[#EAE3D2]" : "hover:bg-background text-foreground"
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            aria-label="إعادة ضبط إعدادات القراءة"
            className={cn(
              "h-9 px-2.5 text-xs whitespace-nowrap shrink-0",
              nightMode ? "text-[#A7B8B0] hover:text-[#EAE3D2] hover:bg-[#1E2D27]" : "text-muted-foreground"
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">افتراضي</span>
          </Button>
        </div>
      </div>

      {/* Expanded controls when Reading Mode is active */}
      {readingMode && (
        <div
          className={cn(
            "mt-3.5 pt-3.5 border-t grid gap-4 sm:grid-cols-2 items-center",
            nightMode ? "border-[#283932]" : "border-border/70"
          )}
        >
          {/* Font size selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0",
                nightMode ? "text-[#A7B8B0]" : "text-muted-foreground"
              )}
            >
              <Type className="h-3.5 w-3.5" />
              حجم الخط:
            </span>
            <div
              className={cn(
                "inline-flex items-center gap-1 p-1 rounded-xl border",
                nightMode ? "bg-[#101815] border-[#283932]" : "bg-muted/50 border-border"
              )}
            >
              {FONT_SIZE_ORDER.map((size) => {
                const active = fontSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onSetFontSize(size)}
                    aria-pressed={active}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                      active
                        ? nightMode
                          ? "bg-[#283932] text-[#E5C158] shadow-sm"
                          : "bg-primary text-primary-foreground shadow-sm"
                        : nightMode
                          ? "text-[#A7B8B0] hover:text-[#EAE3D2]"
                          : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {FONT_SIZE_LABELS[size]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background color selector */}
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0",
                nightMode ? "text-[#A7B8B0]" : "text-muted-foreground"
              )}
            >
              <Palette className="h-3.5 w-3.5" />
              لون الخلفية:
            </span>
            <div className="inline-flex items-center gap-1.5 flex-wrap">
              {BG_THEME_OPTIONS.map((option) => {
                const isSelected = !nightMode && bgTheme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSetBgTheme(option.id)}
                    aria-pressed={isSelected}
                    aria-label={`خلفية ${option.label}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap shrink-0",
                      isSelected
                        ? "ring-2 ring-primary border-primary font-bold"
                        : nightMode
                          ? "border-[#283932] bg-[#101815] text-[#A7B8B0] hover:text-[#EAE3D2]"
                          : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 rounded-full border shrink-0",
                        option.swatchClass
                      )}
                    />
                    <span>{option.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={onToggleNightMode}
                aria-pressed={nightMode}
                aria-label="خلفية ليلية مريحة للعين"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap shrink-0",
                  nightMode
                    ? "ring-2 ring-[#D4AF37] border-[#D4AF37] bg-[#101815] text-[#E5C158] font-bold"
                    : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>ليلي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
