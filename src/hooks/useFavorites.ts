import { useCallback, useEffect, useState } from "react";

export interface FavoriteItem {
  id: string;
  sourceId: string;
  type: "azkar" | "dua";
  title?: string;
  text: string;
  category: string;
  repeat_count?: number;
  virtue?: string | null;
  source?: string | null;
  savedAt: string;
}

const STORAGE_KEY = "al_noor_favorites_v1";
const SYNC_EVENT = "al-noor-favorites-change";

export function makeFavoriteId(type: "azkar" | "dua", sourceId: string): string {
  return `${type}:${sourceId}`;
}

function loadFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is FavoriteItem =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.sourceId === "string" &&
        (item.type === "azkar" || item.type === "dua") &&
        typeof item.text === "string"
    );
  } catch {
    return [];
  }
}

function saveFavoritesToStorage(items: FavoriteItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch {
    // Ignore storage quota errors
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites);

  useEffect(() => {
    const handleSync = () => {
      setFavorites(loadFavorites());
    };
    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const isFavorite = useCallback(
    (type: "azkar" | "dua", sourceId: string): boolean => {
      const id = makeFavoriteId(type, sourceId);
      return favorites.some((item) => item.id === id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (input: Omit<FavoriteItem, "id" | "savedAt">): boolean => {
      const current = loadFavorites();
      const id = makeFavoriteId(input.type, input.sourceId);
      const exists = current.some((item) => item.id === id);
      let next: FavoriteItem[];
      if (exists) {
        next = current.filter((item) => item.id !== id);
      } else {
        const newItem: FavoriteItem = {
          ...input,
          id,
          savedAt: new Date().toISOString(),
        };
        next = [newItem, ...current];
      }
      setFavorites(next);
      saveFavoritesToStorage(next);
      return !exists;
    },
    []
  );

  const removeFavorite = useCallback((id: string) => {
    const current = loadFavorites();
    const next = current.filter((item) => item.id !== id);
    setFavorites(next);
    saveFavoritesToStorage(next);
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavoritesToStorage([]);
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}
