import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clearQuranBookmark,
  deduplicateQuestions,
  filterSurahs,
  getAyahAudioCandidates,
  getNextContinuousPlaybackTarget,
  getNextSurahNumber,
  getPrevSurahNumber,
  loadQuranBookmark,
  loadSeenQuestionIds,
  normalizeQuestionText,
  saveQuranBookmark,
  saveSeenQuestionIds,
  selectNonRepeatingQuestions,
  shouldAdvanceAyahEarly,
  stripLeadingBasmalah,
  toArabicNumerals,
} from "../src/lib/quranAndQuizUtils.ts";
import { DEFAULT_QUESTIONS } from "../src/data/islamicData.ts";

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, val: string) => {
      map.set(key, val);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe("Quran & Quiz Pure Logic (node:test)", () => {
  it("DEFAULT_QUESTIONS has 40 unique Islamic questions without duplicate IDs or texts", () => {
    assert.equal(DEFAULT_QUESTIONS.length, 40);
    const deduped = deduplicateQuestions(DEFAULT_QUESTIONS);
    assert.equal(deduped.length, 40);
  });

  it("selectNonRepeatingQuestions selects 4 consecutive rounds of 10 questions with zero overlap across all 40 questions", () => {
    let seenIds: string[] = [];
    const allPickedIds = new Set<string>();

    for (let round = 0; round < 4; round++) {
      const { selected, updatedSeenIds, cycleReset } = selectNonRepeatingQuestions({
        pool: DEFAULT_QUESTIONS,
        count: 10,
        seenIds,
      });

      assert.equal(selected.length, 10);
      assert.equal(cycleReset, false);

      for (const q of selected) {
        assert.equal(
          allPickedIds.has(q.id),
          false,
          `Question ${q.id} was repeated in round ${round + 1}`
        );
        allPickedIds.add(q.id);
      }

      seenIds = updatedSeenIds;
    }

    assert.equal(allPickedIds.size, 40);

    // 5th round should cleanly wrap around (cycleReset = true) and still return 10 unique questions
    const fifthRound = selectNonRepeatingQuestions({
      pool: DEFAULT_QUESTIONS,
      count: 10,
      seenIds,
    });
    assert.equal(fifthRound.selected.length, 10);
    assert.equal(fifthRound.cycleReset, true);
    assert.equal(new Set(fifthRound.selected.map((q) => q.id)).size, 10);
  });

  it("deduplicateQuestions removes questions with identical normalized Arabic text even if IDs differ", () => {
    const sample = [
      { id: "1", question_text: "ما هي السورة التي تسمى قلب القرآن؟" },
      { id: "2", question_text: "ما هي السورةُ التي تُسمّى «قلب القرآن» ؟!" },
      { id: "3", question_text: "في أي عام هجري وقعت غزوة بدر الكبرى؟" },
    ];
    assert.equal(normalizeQuestionText(sample[0].question_text), normalizeQuestionText(sample[1].question_text));
    const deduped = deduplicateQuestions(sample);
    assert.equal(deduped.length, 2);
    assert.equal(deduped[0].id, "1");
    assert.equal(deduped[1].id, "3");
  });

  it("persists and loads seen question IDs in storage", () => {
    const storage = createMemoryStorage();
    assert.deepEqual(loadSeenQuestionIds(storage), []);
    saveSeenQuestionIds(["q-1", "q-2", "q-1"], storage);
    assert.deepEqual(loadSeenQuestionIds(storage), ["q-1", "q-2"]);
  });

  it("saves, loads, and clears Quran reading stop bookmark", () => {
    const storage = createMemoryStorage();
    assert.equal(loadQuranBookmark(storage), null);

    const saved = saveQuranBookmark(
      {
        surahNumber: 18,
        surahName: "الكهف",
        englishName: "Al-Kahf",
        ayahNumberInSurah: 10,
        ayahTextSnippet: "إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
      storage
    );

    const loaded = loadQuranBookmark(storage);
    assert.deepEqual(loaded, saved);

    clearQuranBookmark(storage);
    assert.equal(loadQuranBookmark(storage), null);
  });

  it("builds ordered multi-CDN audio fallback candidates for an ayah", () => {
    const candidates = getAyahAudioCandidates({
      audio: "https://primary.cdn/ayah1.mp3",
      audioSecondary: ["https://backup.cdn/ayah1.mp3", "https://primary.cdn/ayah1.mp3"],
      ayahGlobalNumber: 7,
      reciterId: "ar.husarymujawwad",
    });

    assert.equal(candidates[0], "https://primary.cdn/ayah1.mp3");
    assert.equal(candidates[1], "https://backup.cdn/ayah1.mp3");
    assert.ok(candidates.includes("https://cdn.islamic.network/quran/audio/128/ar.husarymujawwad/7.mp3"));
    assert.ok(candidates.includes("https://cdn.islamic.network/quran/audio/64/ar.husarymujawwad/7.mp3"));
    assert.ok(candidates.includes("https://cdn.islamic.network/quran/audio/128/ar.husary/7.mp3"));
    assert.ok(candidates.includes("https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3"));
  });

  it("trims trailing silence via shouldAdvanceAyahEarly and advances continuously across ayahs and surahs without stopping", () => {
    // Should not advance at start of ayah or when duration is NaN/short
    assert.equal(shouldAdvanceAyahEarly(0.1, 5.0, 0.25), false);
    assert.equal(shouldAdvanceAyahEarly(2.0, 5.0, 0.25), false);
    assert.equal(shouldAdvanceAyahEarly(0.8, 1.0, 0.25), false);
    assert.equal(shouldAdvanceAyahEarly(4.8, Number.NaN, 0.25), false);

    // Should advance early when within trailing silence window (<= 0.25s remaining)
    assert.equal(shouldAdvanceAyahEarly(4.8, 5.0, 0.25), true);
    assert.equal(shouldAdvanceAyahEarly(4.95, 5.0, 0.25), true);

    // Next/Prev surah wrap-around (1..114)
    assert.equal(getNextSurahNumber(1), 2);
    assert.equal(getNextSurahNumber(114), 1);
    assert.equal(getPrevSurahNumber(1), 114);
    assert.equal(getPrevSurahNumber(2), 1);

    // Continuous target resolution within surah vs across surah boundary
    assert.deepEqual(
      getNextContinuousPlaybackTarget({
        currentAyahIndex: 0,
        totalAyahs: 7,
        currentSurahNumber: 1,
      }),
      { type: "next-ayah", ayahIndex: 1, surahNumber: 1 }
    );

    assert.deepEqual(
      getNextContinuousPlaybackTarget({
        currentAyahIndex: 6,
        totalAyahs: 7,
        currentSurahNumber: 1,
      }),
      { type: "next-surah", ayahIndex: 0, surahNumber: 2 }
    );
  });

  it("formats Eastern Arabic numerals, strips duplicate Basmalah in Mushaf view, and filters surahs", () => {
    assert.equal(toArabicNumerals(1), "١");
    assert.equal(toArabicNumerals(286), "٢٨٦");
    assert.equal(toArabicNumerals("114"), "١١٤");

    // Surah 1 keeps Basmalah as Ayah 1
    assert.equal(
      stripLeadingBasmalah("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", 1, 1),
      "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
    );

    // Surah 112 Ayah 1 strips leading Basmalah (exact api.alquran.cloud Uthmani string with U+06E1, U+0640, U+0670, and U+06CC)
    assert.equal(
      stripLeadingBasmalah("بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ قُلۡ هُوَ ٱللَّهُ أَحَدٌ\n", 112, 1),
      "قُلۡ هُوَ ٱللَّهُ أَحَدٌ"
    );

    const sampleSurahs = [
      { number: 1, name: "سُورَةُ الفاتحة", englishName: "Al-Fatihah", revelationType: "Meccan" },
      { number: 2, name: "سُورَةُ البقرة", englishName: "Al-Baqarah", revelationType: "Medinan" },
      { number: 18, name: "سُورَةُ الكهف", englishName: "Al-Kahf", revelationType: "Meccan" },
    ];

    assert.equal(filterSurahs(sampleSurahs, "", "all").length, 3);
    assert.equal(filterSurahs(sampleSurahs, "", "Meccan").length, 2);
    assert.equal(filterSurahs(sampleSurahs, "", "Medinan").length, 1);
    assert.equal(filterSurahs(sampleSurahs, "الكهف", "all")[0]?.number, 18);
    assert.equal(filterSurahs(sampleSurahs, "سورة البقرة", "all")[0]?.number, 2);
    assert.equal(filterSurahs(sampleSurahs, "18", "all")[0]?.number, 18);
    assert.equal(filterSurahs(sampleSurahs, "١٨", "all")[0]?.number, 18);
  });
});


