export interface QuranBookmark {
  surahNumber: number;
  surahName: string;
  englishName: string;
  ayahNumberInSurah: number;
  ayahTextSnippet?: string;
  updatedAt: string;
}

export const QURAN_BOOKMARK_STORAGE_KEY = "noor-quran-bookmark-v1";
export const QUIZ_SEEN_STORAGE_KEY = "noor-quiz-seen-ids-v1";

export function loadQuranBookmark(
  storage: Pick<Storage, "getItem"> | undefined = typeof window !== "undefined" ? window.localStorage : undefined
): QuranBookmark | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(QURAN_BOOKMARK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<QuranBookmark>;
    if (
      typeof parsed.surahNumber === "number" &&
      parsed.surahNumber >= 1 &&
      parsed.surahNumber <= 114 &&
      typeof parsed.ayahNumberInSurah === "number" &&
      parsed.ayahNumberInSurah >= 1 &&
      typeof parsed.surahName === "string" &&
      typeof parsed.englishName === "string"
    ) {
      return {
        surahNumber: parsed.surahNumber,
        surahName: parsed.surahName,
        englishName: parsed.englishName,
        ayahNumberInSurah: parsed.ayahNumberInSurah,
        ayahTextSnippet: typeof parsed.ayahTextSnippet === "string" ? parsed.ayahTextSnippet : undefined,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveQuranBookmark(
  bookmark: QuranBookmark,
  storage: Pick<Storage, "setItem"> | undefined = typeof window !== "undefined" ? window.localStorage : undefined
): QuranBookmark {
  if (storage) {
    try {
      storage.setItem(QURAN_BOOKMARK_STORAGE_KEY, JSON.stringify(bookmark));
    } catch {
      // Ignore storage quota errors
    }
  }
  return bookmark;
}

export function clearQuranBookmark(
  storage: Pick<Storage, "removeItem"> | undefined = typeof window !== "undefined" ? window.localStorage : undefined
): void {
  if (!storage) return;
  try {
    storage.removeItem(QURAN_BOOKMARK_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function getAyahAudioCandidates(params: {
  audio?: string;
  audioSecondary?: string[];
  ayahGlobalNumber?: number;
  reciterId: string;
}): string[] {
  const { audio, audioSecondary, ayahGlobalNumber, reciterId } = params;
  const candidates: string[] = [];
  const addUrl = (url?: string) => {
    if (typeof url === "string") {
      const trimmed = url.trim();
      if (trimmed.startsWith("http") && !candidates.includes(trimmed)) {
        candidates.push(trimmed);
      }
    }
  };

  addUrl(audio);
  if (Array.isArray(audioSecondary)) {
    for (const sec of audioSecondary) {
      addUrl(sec);
    }
  }

  if (typeof ayahGlobalNumber === "number" && ayahGlobalNumber >= 1 && ayahGlobalNumber <= 6236) {
    addUrl(`https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayahGlobalNumber}.mp3`);
    addUrl(`https://cdn.islamic.network/quran/audio/64/${reciterId}/${ayahGlobalNumber}.mp3`);
    addUrl(`https://cdn.islamic.network/quran/audio/128/ar.husary/${ayahGlobalNumber}.mp3`);
    addUrl(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahGlobalNumber}.mp3`);
  }

  return candidates;
}

const FULL_SURAH_RECITER_SOURCES: Record<string, readonly string[]> = {
  "ar.husary": [
    "https://cdn.mp3quran.net/audio/mahmoud-husary/r1",
    "https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree",
    "https://server13.mp3quran.net/husr",
  ],
  "ar.husarymujawwad": [
    "https://cdn.mp3quran.net/audio/mahmoud-husary/r2",
    "https://server13.mp3quran.net/husr/Almusshaf-Al-Mojawwad",
    "https://cdn.mp3quran.net/audio/mahmoud-husary/r1",
  ],
  "ar.minshawi": [
    "https://cdn.mp3quran.net/audio/muhammad-minshawi/r1",
    "https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee",
    "https://server10.mp3quran.net/minsh",
  ],
  "ar.minshawimujawwad": [
    "https://cdn.mp3quran.net/audio/muhammad-minshawi/r2",
    "https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad",
    "https://cdn.mp3quran.net/audio/muhammad-minshawi/r1",
  ],
  "ar.alafasy": [
    "https://cdn.mp3quran.net/audio/mishary-alafasy/r1",
    "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee",
    "https://server8.mp3quran.net/afs",
  ],
  "ar.abdulbasitmurattal": [
    "https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3",
    "https://download.quranicaudio.com/quran/abdul_basit_murattal",
    "https://server7.mp3quran.net/basit",
  ],
  "ar.abdurrahmaansudais": [
    "https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1",
    "https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays",
    "https://server11.mp3quran.net/sds",
  ],
  "ar.mahermuaiqly": [
    "https://cdn.mp3quran.net/audio/maher-muaiqly/r1",
    "https://download.quranicaudio.com/quran/maher_256",
    "https://server12.mp3quran.net/maher",
  ],
  "ar.muhammadayyoub": [
    "https://cdn.mp3quran.net/audio/muhammad-ayyub/r1",
    "https://download.quranicaudio.com/quran/muhammad_ayyoob",
    "https://server8.mp3quran.net/ayyub",
  ],
  "ar.hanirifai": [
    "https://cdn.mp3quran.net/audio/hani-rifai/r1",
    "https://download.quranicaudio.com/quran/rifai",
    "https://server8.mp3quran.net/hani",
  ],
};

export function getFullSurahAudioUrls(surahNumber: number, reciterId: string): string[] {
  const safeSurah = Math.max(1, Math.min(114, Math.floor(Number(surahNumber) || 1)));
  const padded = String(safeSurah).padStart(3, "0");
  const bases = FULL_SURAH_RECITER_SOURCES[reciterId] ?? FULL_SURAH_RECITER_SOURCES["ar.husary"];
  const urls = bases.map((base) => `${base}/${padded}.mp3`);
  // Always include Husary & Alafasy full-surah mirrors as final fallbacks
  const fallbackUrl = `https://cdn.mp3quran.net/audio/mahmoud-husary/r1/${padded}.mp3`;
  if (!urls.includes(fallbackUrl)) {
    urls.push(fallbackUrl);
  }
  return urls;
}

export function shouldAdvanceAyahEarly(
  currentTime: number,
  duration: number,
  leadTimeSec = 0.25
): boolean {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) return false;
  if (duration <= 1.2 || currentTime < 0.4) return false;
  const remaining = duration - currentTime;
  return remaining >= 0 && remaining <= Math.max(0.05, leadTimeSec);
}

export function getNextSurahNumber(currentSurahNumber: number): number {
  if (!Number.isFinite(currentSurahNumber) || currentSurahNumber < 1 || currentSurahNumber >= 114) {
    return 1;
  }
  return Math.floor(currentSurahNumber) + 1;
}

export function getPrevSurahNumber(currentSurahNumber: number): number {
  if (!Number.isFinite(currentSurahNumber) || currentSurahNumber <= 1 || currentSurahNumber > 114) {
    return 114;
  }
  return Math.floor(currentSurahNumber) - 1;
}

export function getNextContinuousPlaybackTarget(params: {
  currentAyahIndex: number;
  totalAyahs: number;
  currentSurahNumber: number;
}): {
  type: "next-ayah" | "next-surah";
  ayahIndex: number;
  surahNumber: number;
} {
  const { currentAyahIndex, totalAyahs, currentSurahNumber } = params;
  const nextIdx = currentAyahIndex + 1;
  if (nextIdx >= 0 && nextIdx < totalAyahs) {
    return {
      type: "next-ayah",
      ayahIndex: nextIdx,
      surahNumber: currentSurahNumber,
    };
  }
  return {
    type: "next-surah",
    ayahIndex: 0,
    surahNumber: getNextSurahNumber(currentSurahNumber),
  };
}

export function normalizeQuestionText(text: string): string {
  return text
    .normalize("NFKC")
    // Strip BOM and zero-width formatting characters (present in api.alquran.cloud ayah 1)
    .replace(/[\uFEFF\u200B-\u200F\u061C]/g, "")
    // Strip Arabic diacritics (tashkeel), Quranic annotation signs, and tatweel
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    // Normalize alef variants including Uthmani alif wasla (ٱ)
    .replace(/[أإآٱ]/g, "ا")
    // Normalize teh marbuta, alef maksura, and Farsi yeh (U+06CC used in Uthmani Quran editions)
    .replace(/ة/g, "ه")
    .replace(/[ىی]/g, "ي")
    // Strip punctuation Marks
    .replace(/[؟?!.,،؛:"'«»()[\]\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function deduplicateQuestions<T extends { id: string; question_text: string }>(
  questions: readonly T[]
): T[] {
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();
  const result: T[] = [];

  for (const q of questions) {
    if (!q || typeof q.id !== "string" || typeof q.question_text !== "string") continue;
    const normText = normalizeQuestionText(q.question_text);
    if (!normText) continue;
    if (seenIds.has(q.id) || seenTexts.has(normText)) continue;
    seenIds.add(q.id);
    seenTexts.add(normText);
    result.push(q);
  }

  return result;
}

export function shuffleArray<T>(
  items: readonly T[],
  rng: () => number = Math.random
): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function selectNonRepeatingQuestions<
  T extends { id: string; question_text: string; category?: string }
>(params: {
  pool: readonly T[];
  count: number;
  seenIds: readonly string[];
  category?: string;
  rng?: () => number;
}): {
  selected: T[];
  updatedSeenIds: string[];
  cycleReset: boolean;
} {
  const { pool, count, seenIds, category, rng = Math.random } = params;
  const uniquePool = deduplicateQuestions(pool);
  const filteredPool =
    category && category !== "all"
      ? uniquePool.filter((q) => q.category === category)
      : uniquePool;

  const activePool = filteredPool.length > 0 ? filteredPool : uniquePool;
  const targetCount = Math.min(Math.max(1, count), activePool.length);

  if (activePool.length === 0) {
    return { selected: [], updatedSeenIds: [...seenIds], cycleReset: false };
  }

  const seenSet = new Set(seenIds);
  const unseen = activePool.filter((q) => !seenSet.has(q.id));
  const seen = activePool.filter((q) => seenSet.has(q.id));

  if (unseen.length >= targetCount) {
    const picked = shuffleArray(unseen, rng).slice(0, targetCount);
    const updatedSeenIds = Array.from(new Set([...seenIds, ...picked.map((q) => q.id)]));
    return {
      selected: picked,
      updatedSeenIds,
      cycleReset: false,
    };
  }

  // Not enough unseen questions left to fill the round:
  // Take all remaining unseen questions first, then fill the rest from shuffled seen questions,
  // and reset the seen history to the newly selected round so the next round won't repeat these either.
  const shuffledUnseen = shuffleArray(unseen, rng);
  const neededFromSeen = targetCount - shuffledUnseen.length;
  const shuffledSeen = shuffleArray(seen, rng).slice(0, neededFromSeen);
  const combined = shuffleArray([...shuffledUnseen, ...shuffledSeen], rng);

  // Preserve seen IDs from other categories while resetting seen IDs for the active pool
  const activePoolIds = new Set(activePool.map((q) => q.id));
  const otherCategorySeenIds = seenIds.filter((id) => !activePoolIds.has(id));
  const updatedSeenIds = Array.from(
    new Set([...otherCategorySeenIds, ...combined.map((q) => q.id)])
  );

  return {
    selected: combined,
    updatedSeenIds,
    cycleReset: true,
  };
}

export function loadSeenQuestionIds(
  storage: Pick<Storage, "getItem"> | undefined = typeof window !== "undefined" ? window.localStorage : undefined
): string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(QUIZ_SEEN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export function saveSeenQuestionIds(
  ids: readonly string[],
  storage: Pick<Storage, "setItem"> | undefined = typeof window !== "undefined" ? window.localStorage : undefined
): void {
  if (!storage) return;
  try {
    storage.setItem(QUIZ_SEEN_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // Ignore quota errors
  }
}

const EASTERN_ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

export function toArabicNumerals(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => EASTERN_ARABIC_DIGITS[Number(digit)] ?? digit);
}

export function stripLeadingBasmalah(
  text: string,
  surahNumber: number,
  numberInSurah: number
): string {
  if (surahNumber === 1 || surahNumber === 9 || numberInSurah !== 1) {
    return text;
  }
  const trimmed = text.replace(/^[\uFEFF\u200B-\u200F\u061C\s]+/, "").trim();
  const tokens = trimmed.split(/\s+/);
  if (tokens.length > 4) {
    const toBaseArabic = (word: string) =>
      word
        .replace(/[أإآٱ]/g, "ا")
        .replace(/[ىی]/g, "ي")
        .replace(/[^\u0621-\u063A\u0641-\u064A]/g, "");
    const firstFourBase = tokens.slice(0, 4).map(toBaseArabic).join(" ");
    if (firstFourBase === "بسم الله الرحمن الرحيم") {
      return tokens.slice(4).join(" ").trim();
    }
  }
  return text;
}

export function formatSurahUiName(rawName: string): string {
  return rawName
    .replace(/^سُورَةُ\s*/, "")
    .replace(/\u06E1/g, "\u0652")
    .replace(/\u0671/g, "ا")
    .trim();
}


export function filterSurahs<
  T extends {
    number: number;
    name: string;
    englishName: string;
    revelationType: string;
  }
>(
  surahs: readonly T[],
  searchQuery: string,
  revelationFilter: "all" | "Meccan" | "Medinan" = "all"
): T[] {
  const normalizedQuery = normalizeQuestionText(searchQuery).replace(/^سوره\s+/, "").trim();

  return surahs.filter((surah) => {
    if (revelationFilter !== "all" && surah.revelationType !== revelationFilter) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const cleanArabicName = normalizeQuestionText(surah.name.replace(/^سُورَةُ\s*/, ""));
    const fullArabicName = normalizeQuestionText(surah.name);
    const english = surah.englishName.toLowerCase();
    const numStr = String(surah.number);
    const arabicNumStr = toArabicNumerals(surah.number);

    return (
      cleanArabicName.includes(normalizedQuery) ||
      fullArabicName.includes(normalizedQuery) ||
      english.includes(normalizedQuery) ||
      numStr === normalizedQuery ||
      arabicNumStr === searchQuery.trim()
    );
  });
}

export function mergeUniqueAzkar<
  T extends {
    id: string;
    text: string;
    repeat_count: number;
    virtue: string | null;
    source: string | null;
  }
>(defaultItems: readonly T[], remoteOrStoredItems: readonly T[] = []): T[] {
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();
  const result: T[] = [];

  const stripBasmalahPrefix = (norm: string) =>
    norm.replace(/^بسم الله الرحمن الرحيم\s+/, "").trim();

  const isDuplicateOfExisting = (norm: string) => {
    if (seenTexts.has(norm)) return true;
    const core = stripBasmalahPrefix(norm);
    for (const existing of seenTexts) {
      const existingCore = stripBasmalahPrefix(existing);
      if (core === existingCore) return true;
      if (
        core.length >= 25 &&
        existingCore.length >= 25 &&
        core.slice(0, 25) === existingCore.slice(0, 25)
      ) {
        return true;
      }
    }
    return false;
  };

  for (const item of [...defaultItems, ...remoteOrStoredItems]) {
    if (!item || typeof item.id !== "string" || typeof item.text !== "string") continue;
    const norm = normalizeQuestionText(item.text);
    if (!norm) continue;
    if (seenIds.has(item.id) || isDuplicateOfExisting(norm)) continue;
    seenIds.add(item.id);
    seenTexts.add(norm);
    result.push(item);
  }

  return result;
}

const CANONICAL_DUA_CATEGORY_MAP: Record<string, string> = {
  "أدعية قرآنية": "أدعية قرآنية",
  "قرآنية": "أدعية قرآنية",
  "أدعية نبوية": "أدعية نبوية",
  "نبوية": "أدعية نبوية",
  "الهداية": "أدعية نبوية",
  "المغفرة والرحمة": "المغفرة والرحمة",
  "الاستغفار": "المغفرة والرحمة",
  "التوبة": "المغفرة والرحمة",
  "أدعية للميت": "المغفرة والرحمة",
  "تفريج الكرب": "تفريج الكرب",
  "الفرج والرزق": "تفريج الكرب",
  "الكرب والهم": "تفريج الكرب",
  "الرزق والتوفيق": "الرزق والتوفيق",
  "الرزق": "الرزق والتوفيق",
  "الدراسة والامتحان": "الرزق والتوفيق",
  "الشفاء والعافية": "الشفاء والعافية",
  "الشفاء": "الشفاء والعافية",
  "المرض": "الشفاء والعافية",
  "الوالدين والأهل": "الوالدين والأهل",
  "الوالدين": "الوالدين والأهل",
  "الزواج والذرية": "الوالدين والأهل",
  "أدعية اليوم والعبادات": "أدعية اليوم والعبادات",
  "يومية": "أدعية اليوم والعبادات",
  "أدعية يومية": "أدعية اليوم والعبادات",
};

export function normalizeDuaCategory(category: string): string {
  const trimmed = category.trim();
  return CANONICAL_DUA_CATEGORY_MAP[trimmed] ?? trimmed;
}

export function mergeUniqueDuas<
  T extends {
    id: string;
    title: string;
    text: string;
    category: string;
    source: string | null;
  }
>(defaultItems: readonly T[], remoteOrStoredItems: readonly T[] = []): T[] {
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();
  const seenTitles = new Set<string>();
  const result: T[] = [];

  const isDuplicateText = (normText: string) => {
    if (seenTexts.has(normText)) return true;
    for (const existing of seenTexts) {
      if (
        normText.length >= 25 &&
        existing.length >= 25 &&
        normText.slice(0, 25) === existing.slice(0, 25)
      ) {
        return true;
      }
    }
    return false;
  };

  for (const item of [...defaultItems, ...remoteOrStoredItems]) {
    if (!item || typeof item.id !== "string" || typeof item.text !== "string" || typeof item.title !== "string") {
      continue;
    }
    const normText = normalizeQuestionText(item.text);
    const normTitle = normalizeQuestionText(item.title);
    if (!normText) continue;
    if (seenIds.has(item.id) || isDuplicateText(normText) || (normTitle && seenTitles.has(normTitle))) {
      continue;
    }
    seenIds.add(item.id);
    seenTexts.add(normText);
    if (normTitle) seenTitles.add(normTitle);
    result.push({
      ...item,
      category: normalizeDuaCategory(item.category),
    });
  }

  return result;
}

export function filterAzkar<
  T extends {
    text: string;
    virtue?: string | null;
    source?: string | null;
  }
>(items: readonly T[], searchQuery: string): T[] {
  const normQuery = normalizeQuestionText(searchQuery);
  if (!normQuery) return [...items];
  return items.filter((item) => {
    const normText = normalizeQuestionText(item.text);
    const normVirtue = item.virtue ? normalizeQuestionText(item.virtue) : "";
    const normSource = item.source ? normalizeQuestionText(item.source) : "";
    return (
      normText.includes(normQuery) ||
      normVirtue.includes(normQuery) ||
      normSource.includes(normQuery)
    );
  });
}

export function filterDuas<
  T extends {
    title: string;
    text: string;
    category: string;
    source?: string | null;
  }
>(items: readonly T[], categoryFilter: string = "all", searchQuery: string = ""): T[] {
  const normQuery = normalizeQuestionText(searchQuery);
  return items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false;
    }
    if (!normQuery) return true;
    const normTitle = normalizeQuestionText(item.title);
    const normText = normalizeQuestionText(item.text);
    const normCat = normalizeQuestionText(item.category);
    const normSource = item.source ? normalizeQuestionText(item.source) : "";
    return (
      normTitle.includes(normQuery) ||
      normText.includes(normQuery) ||
      normCat.includes(normQuery) ||
      normSource.includes(normQuery)
    );
  });
}

export function filterHadiths<
  T extends {
    number?: number;
    title: string;
    narrator: string;
    text: string;
    explanation?: string;
    category: string;
    source?: string | null;
  }
>(items: readonly T[], categoryFilter: string = "all", searchQuery: string = ""): T[] {
  const normQuery = normalizeQuestionText(searchQuery);
  return items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false;
    }
    if (!normQuery) return true;
    const normTitle = normalizeQuestionText(item.title);
    const normNarrator = normalizeQuestionText(item.narrator);
    const normText = normalizeQuestionText(item.text);
    const normExp = item.explanation ? normalizeQuestionText(item.explanation) : "";
    const normCat = normalizeQuestionText(item.category);
    const normSource = item.source ? normalizeQuestionText(item.source) : "";
    const numStr = item.number ? String(item.number) : "";
    const arabicNumStr = item.number ? toArabicNumerals(item.number) : "";

    return (
      normTitle.includes(normQuery) ||
      normNarrator.includes(normQuery) ||
      normText.includes(normQuery) ||
      normExp.includes(normQuery) ||
      normCat.includes(normQuery) ||
      normSource.includes(normQuery) ||
      numStr === normQuery ||
      arabicNumStr === searchQuery.trim()
    );
  });
}

export function getDailyHadith<T>(items: readonly T[], date: Date = new Date()): T | null {
  if (!items.length) return null;
  const seed = date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate();
  return items[seed % items.length] ?? items[0] ?? null;
}



