import { useCallback, useEffect, useState } from "react";

export type ReadingFontSize = "sm" | "md" | "lg" | "xl";
export type ReadingBgTheme = "default" | "parchment" | "sepia" | "sage";

export interface ReadingSettings {
  readingMode: boolean;
  fontSize: ReadingFontSize;
  bgTheme: ReadingBgTheme;
  nightMode: boolean;
}

const STORAGE_KEY = "al_noor_reading_settings_v1";
const SYNC_EVENT = "al-noor-reading-settings-change";

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  readingMode: false,
  fontSize: "md",
  bgTheme: "default",
  nightMode: false,
};

export const FONT_SIZE_ORDER: ReadingFontSize[] = ["sm", "md", "lg", "xl"];

export const FONT_SIZE_LABELS: Record<ReadingFontSize, string> = {
  sm: "صغير",
  md: "متوسط",
  lg: "كبير",
  xl: "كبير جداً",
};

export const FONT_SIZE_CLASSES: Record<
  ReadingFontSize,
  { azkar: string; quran: string }
> = {
  sm: {
    azkar: "text-base sm:text-lg md:text-xl leading-[2.0]",
    quran: "text-xl md:text-2xl leading-[2.3]",
  },
  md: {
    azkar: "text-lg sm:text-xl md:text-2xl leading-[2.2]",
    quran: "text-2xl md:text-3xl leading-[2.6]",
  },
  lg: {
    azkar: "text-xl sm:text-2xl md:text-3xl leading-[2.35]",
    quran: "text-3xl md:text-4xl leading-[2.75]",
  },
  xl: {
    azkar: "text-2xl sm:text-3xl md:text-4xl leading-[2.5]",
    quran: "text-4xl md:text-5xl leading-[2.9]",
  },
};

export const BG_THEME_OPTIONS: {
  id: ReadingBgTheme;
  label: string;
  swatchClass: string;
  cardStyle: string;
  sectionStyle: string;
}[] = [
  {
    id: "default",
    label: "افتراضي",
    swatchClass: "bg-white border-stone-300",
    cardStyle: "bg-gradient-card border-border text-foreground",
    sectionStyle: "",
  },
  {
    id: "parchment",
    label: "كريمي (مصحف)",
    swatchClass: "bg-[#FBF6E9] border-[#E2D6B5]",
    cardStyle: "bg-[#FBF6E9] border-[#E2D6B5] text-[#262118]",
    sectionStyle: "bg-[#F6EFE0]/70",
  },
  {
    id: "sepia",
    label: "ورق دافئ",
    swatchClass: "bg-[#F3E7CE] border-[#D8C59E]",
    cardStyle: "bg-[#F3E7CE] border-[#D8C59E] text-[#2C2216]",
    sectionStyle: "bg-[#EDE0C4]/65",
  },
  {
    id: "sage",
    label: "أخضر هادئ",
    swatchClass: "bg-[#ECF4EE] border-[#C4DEC9]",
    cardStyle: "bg-[#ECF4EE] border-[#C4DEC9] text-[#172A20]",
    sectionStyle: "bg-[#E3EFE7]/65",
  },
];

export const NIGHT_MODE_STYLES = {
  sectionStyle: "bg-[#0F1714] text-[#EAE3D2] rounded-3xl transition-colors duration-300",
  cardStyle: "bg-[#17221E] border-[#283932] text-[#EAE3D2] shadow-none",
  mutedText: "text-[#A7B8B0]",
  virtueBox: "bg-[#1E2D27] border-[#31473E] text-[#DCE6E0]",
  virtueLabel: "text-[#E5C158]",
};

function loadSettings(): ReadingSettings {
  if (typeof window === "undefined") return DEFAULT_READING_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_READING_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReadingSettings>;
    return {
      readingMode: typeof parsed.readingMode === "boolean" ? parsed.readingMode : false,
      fontSize:
        parsed.fontSize && FONT_SIZE_ORDER.includes(parsed.fontSize)
          ? parsed.fontSize
          : "md",
      bgTheme:
        parsed.bgTheme && BG_THEME_OPTIONS.some((o) => o.id === parsed.bgTheme)
          ? parsed.bgTheme
          : "default",
      nightMode: typeof parsed.nightMode === "boolean" ? parsed.nightMode : false,
    };
  } catch {
    return DEFAULT_READING_SETTINGS;
  }
}

export function useReadingSettings() {
  const [settings, setSettingsState] = useState<ReadingSettings>(loadSettings);

  useEffect(() => {
    const onSync = () => {
      setSettingsState(loadSettings());
    };
    window.addEventListener(SYNC_EVENT, onSync);
    window.addEventListener("storage", onSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync);
      window.removeEventListener("storage", onSync);
    };
  }, []);

  const updateSettings = useCallback(
    (updater: Partial<ReadingSettings> | ((prev: ReadingSettings) => ReadingSettings)) => {
      setSettingsState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event(SYNC_EVENT));
        } catch {
          // Ignore storage errors
        }
        return next;
      });
    },
    []
  );

  const toggleReadingMode = useCallback(() => {
    updateSettings((prev) => ({ ...prev, readingMode: !prev.readingMode }));
  }, [updateSettings]);

  const toggleNightMode = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      readingMode: true,
      nightMode: !prev.nightMode,
    }));
  }, [updateSettings]);

  const setFontSize = useCallback(
    (fontSize: ReadingFontSize) => {
      updateSettings((prev) => ({ ...prev, readingMode: true, fontSize }));
    },
    [updateSettings]
  );

  const stepFontSize = useCallback(
    (delta: number) => {
      updateSettings((prev) => {
        const idx = FONT_SIZE_ORDER.indexOf(prev.fontSize);
        const nextIdx = Math.max(0, Math.min(FONT_SIZE_ORDER.length - 1, idx + delta));
        return {
          ...prev,
          readingMode: true,
          fontSize: FONT_SIZE_ORDER[nextIdx],
        };
      });
    },
    [updateSettings]
  );

  const setBgTheme = useCallback(
    (bgTheme: ReadingBgTheme) => {
      updateSettings((prev) => ({
        ...prev,
        readingMode: true,
        bgTheme,
        nightMode: false,
      }));
    },
    [updateSettings]
  );

  const resetSettings = useCallback(() => {
    updateSettings(DEFAULT_READING_SETTINGS);
  }, [updateSettings]);

  const activeTheme =
    BG_THEME_OPTIONS.find((t) => t.id === settings.bgTheme) ?? BG_THEME_OPTIONS[0];

  return {
    settings,
    activeTheme,
    toggleReadingMode,
    toggleNightMode,
    setFontSize,
    stepFontSize,
    setBgTheme,
    resetSettings,
  };
}
