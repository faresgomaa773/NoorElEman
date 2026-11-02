import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import {
  getAyahAudioCandidates,
  getNextContinuousPlaybackTarget,
  getNextSurahNumber,
  shouldAdvanceAyahEarly,
} from "@/lib/quranAndQuizUtils";

export interface PlaylistItem {
  audio?: string;
  audioUrls?: string[];
  numberInSurah?: number;
}

export interface Track {
  surahName: string;
  surahNumber: number;
  ayahIndex: number;
  totalAyahs: number;
  audioUrl: string;
  reciterName: string;
  reciterId?: string;
  // Full ayah list to advance continuously
  playlist: PlaylistItem[];
}

interface QuranAudioContextType {
  current: Track | null;
  playing: boolean;
  loadAndPlay: (track: Track) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
}

const Ctx = createContext<QuranAudioContextType | undefined>(undefined);

function getCandidateUrlsForItem(item: PlaylistItem | undefined, primaryFallback?: string): string[] {
  const urls: string[] = [];
  const push = (u?: string) => {
    if (typeof u === "string") {
      const trimmed = u.trim();
      if (trimmed && !urls.includes(trimmed)) {
        urls.push(trimmed);
      }
    }
  };
  if (Array.isArray(item?.audioUrls)) {
    for (const u of item.audioUrls) push(u);
  }
  push(item?.audio);
  push(primaryFallback);
  return urls;
}

async function fetchNextSurahTrack(
  surahNumber: number,
  reciterId: string,
  reciterName: string
): Promise<Track | null> {
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani-quran-academy,${reciterId}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const textAyahs = json?.data?.[0]?.ayahs;
    const audioAyahs = json?.data?.[1]?.ayahs;
    const rawName: string = json?.data?.[0]?.name || `سورة ${surahNumber}`;
    if (json?.code !== 200 || !Array.isArray(textAyahs) || !Array.isArray(audioAyahs) || textAyahs.length === 0) {
      return null;
    }

    const playlist: PlaylistItem[] = textAyahs.map(
      (a: { numberInSurah: number; number: number }, idx: number) => {
        const rec = audioAyahs[idx];
        const candidates = getAyahAudioCandidates({
          audio: rec?.audio,
          audioSecondary: rec?.audioSecondary,
          ayahGlobalNumber: a.number,
          reciterId,
        });
        return {
          numberInSurah: a.numberInSurah,
          audio: candidates[0] ?? rec?.audio,
          audioUrls: candidates,
        };
      }
    );

    const firstUrl = playlist[0]?.audioUrls?.[0] ?? playlist[0]?.audio ?? "";
    if (!firstUrl) return null;

    return {
      surahName: rawName.replace(/^سُورَةُ /, ""),
      surahNumber,
      ayahIndex: 0,
      totalAyahs: playlist.length,
      audioUrl: firstUrl,
      reciterName,
      reciterId,
      playlist,
    };
  } catch {
    return null;
  }
}

export function QuranAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentRef = useRef<Track | null>(null);
  const playingRef = useRef(false);
  const userPausedRef = useRef(false);
  const fallbackIdxRef = useRef(0);
  const playRequestIdRef = useRef(0);
  const failedRequestIdRef = useRef(-1);
  const earlyAdvancedRequestIdRef = useRef(-1);
  const prefetchedSurahRef = useRef<{ key: string; track: Track } | null>(null);

  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);

  // Keep refs synced with state for stable event listeners
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const ensureAudioElements = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      a.setAttribute("playsinline", "");
      audioRef.current = a;
    }
    if (!preloadAudioRef.current) {
      const p = new Audio();
      p.preload = "auto";
      p.muted = true;
      p.setAttribute("playsinline", "");
      preloadAudioRef.current = p;
    }
    return audioRef.current;
  }, []);

  const preloadUpcoming = useCallback((track: Track, nextIdx: number) => {
    const preloader = preloadAudioRef.current;
    if (preloader && nextIdx >= 0 && nextIdx < track.playlist.length) {
      const nextItem = track.playlist[nextIdx];
      const nextCandidates = getCandidateUrlsForItem(nextItem);
      const nextUrl = nextCandidates[0];
      if (nextUrl && preloader.src !== nextUrl) {
        try {
          preloader.src = nextUrl;
        } catch {
          // Ignore preload errors in restricted environments
        }
      }
    }

    // If near the end of the surah, prefetch the next surah metadata/playlist in the background
    if (nextIdx >= track.playlist.length - 1) {
      const nextSurahNum = getNextSurahNumber(track.surahNumber);
      const reciterId = track.reciterId || "ar.husary";
      const cacheKey = `${nextSurahNum}:${reciterId}`;
      if (prefetchedSurahRef.current?.key !== cacheKey) {
        void fetchNextSurahTrack(nextSurahNum, reciterId, track.reciterName).then((fetched) => {
          if (fetched) {
            prefetchedSurahRef.current = { key: cacheKey, track: fetched };
          }
        });
      }
    }
  }, []);

  const playAyahAtIndex = useCallback(
    (track: Track, targetIdx: number, candidateAttempt = 0) => {
      const el = ensureAudioElements();
      if (!el || track.playlist.length === 0) return;

      const safeIdx =
        targetIdx >= 0 && targetIdx < track.playlist.length
          ? targetIdx
          : 0;

      const item = track.playlist[safeIdx];
      const candidates = getCandidateUrlsForItem(
        item,
        safeIdx === track.ayahIndex ? track.audioUrl : undefined
      );
      const chosenUrl = candidates[candidateAttempt];

      if (!chosenUrl) {
        // If all candidates for this ayah failed, immediately continue to the next ayah without stopping
        const nextIdx = (safeIdx + 1) % track.playlist.length;
        if (nextIdx !== safeIdx) {
          fallbackIdxRef.current = 0;
          playAyahAtIndex(track, nextIdx, 0);
        }
        return;
      }

      const reqId = ++playRequestIdRef.current;
      failedRequestIdRef.current = -1;
      earlyAdvancedRequestIdRef.current = -1;
      fallbackIdxRef.current = candidateAttempt;
      userPausedRef.current = false;

      const nextTrack: Track = {
        ...track,
        ayahIndex: safeIdx,
        audioUrl: chosenUrl,
      };
      currentRef.current = nextTrack;
      playingRef.current = true;
      setCurrent(nextTrack);
      setPlaying(true);

      // Preload the next ayah into cache immediately so the transition is gapless
      preloadUpcoming(nextTrack, safeIdx + 1);

      el.src = chosenUrl;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            if (reqId !== playRequestIdRef.current) return;
            playingRef.current = true;
            setPlaying(true);
          })
          .catch((err: unknown) => {
            if (reqId !== playRequestIdRef.current || userPausedRef.current) return;
            // Ignore AbortError caused by rapid track switching
            if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
              return;
            }
            if (failedRequestIdRef.current === reqId) return;
            failedRequestIdRef.current = reqId;

            if (candidateAttempt + 1 < candidates.length) {
              playAyahAtIndex(nextTrack, safeIdx, candidateAttempt + 1);
            } else if (safeIdx + 1 < nextTrack.playlist.length) {
              fallbackIdxRef.current = 0;
              playAyahAtIndex(nextTrack, safeIdx + 1, 0);
            }
          });
      }
    },
    [ensureAudioElements, preloadUpcoming]
  );

  const advanceContinuously = useCallback(() => {
    const c = currentRef.current;
    if (!c || userPausedRef.current) return;

    const target = getNextContinuousPlaybackTarget({
      currentAyahIndex: c.ayahIndex,
      totalAyahs: c.playlist.length,
      currentSurahNumber: c.surahNumber,
    });

    if (target.type === "next-ayah") {
      fallbackIdxRef.current = 0;
      playAyahAtIndex(c, target.ayahIndex, 0);
      return;
    }

    // Reached the end of the current surah: automatically continue to the next surah (or loop if offline)
    const reciterId = c.reciterId || "ar.husary";
    const cacheKey = `${target.surahNumber}:${reciterId}`;
    const cached = prefetchedSurahRef.current;
    if (cached && cached.key === cacheKey) {
      fallbackIdxRef.current = 0;
      playAyahAtIndex(cached.track, 0, 0);
      return;
    }

    const reqIdAtEnd = playRequestIdRef.current;
    void fetchNextSurahTrack(target.surahNumber, reciterId, c.reciterName).then((nextSurahTrack) => {
      if (userPausedRef.current || playRequestIdRef.current !== reqIdAtEnd) return;
      if (nextSurahTrack) {
        prefetchedSurahRef.current = { key: cacheKey, track: nextSurahTrack };
        fallbackIdxRef.current = 0;
        playAyahAtIndex(nextSurahTrack, 0, 0);
      } else {
        // Fallback if offline: continue seamlessly from the beginning of the current surah without stopping
        fallbackIdxRef.current = 0;
        playAyahAtIndex(c, 0, 0);
      }
    });
  }, [playAyahAtIndex]);

  // Initialize audio element once with background-friendly & continuous playback listeners
  useEffect(() => {
    const el = ensureAudioElements();

    const onPlay = () => {
      userPausedRef.current = false;
      playingRef.current = true;
      setPlaying(true);
    };

    const onPause = () => {
      // Only mark playing=false if the user explicitly paused playback.
      // Transient pause events fired by the browser while swapping el.src between ayahs must never stop playback.
      if (userPausedRef.current) {
        playingRef.current = false;
        setPlaying(false);
      }
    };

    const onTimeUpdate = () => {
      const c = currentRef.current;
      if (!c || userPausedRef.current) return;
      const reqId = playRequestIdRef.current;
      if (earlyAdvancedRequestIdRef.current === reqId) return;

      // Trim trailing silence at the end of per-ayah MP3s so recitation flows without stopping at ayahs
      if (shouldAdvanceAyahEarly(el.currentTime, el.duration, 0.25)) {
        earlyAdvancedRequestIdRef.current = reqId;
        advanceContinuously();
      }
    };

    const onEnd = () => {
      const reqId = playRequestIdRef.current;
      if (earlyAdvancedRequestIdRef.current === reqId) return;
      earlyAdvancedRequestIdRef.current = reqId;
      advanceContinuously();
    };

    const onError = () => {
      const c = currentRef.current;
      if (!c || userPausedRef.current) return;
      const reqId = playRequestIdRef.current;
      if (failedRequestIdRef.current === reqId) return;
      failedRequestIdRef.current = reqId;

      const item = c.playlist[c.ayahIndex];
      const candidates = getCandidateUrlsForItem(item, c.audioUrl);
      const nextAttempt = fallbackIdxRef.current + 1;
      if (nextAttempt < candidates.length) {
        playAyahAtIndex(c, c.ayahIndex, nextAttempt);
      } else {
        advanceContinuously();
      }
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnd);
    el.addEventListener("error", onError);

    // Resume audio if browser/tab pauses it on visibility change
    const onVisibility = () => {
      if (!document.hidden && currentRef.current && el.paused && !userPausedRef.current) {
        el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [advanceContinuously, ensureAudioElements, playAyahAtIndex]);

  // Media Session API — lock screen / notification controls for true background playback
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (!current) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `سورة ${current.surahName} • آية ${current.ayahIndex + 1}/${current.totalAyahs}`,
      artist: current.reciterName,
      album: "القرآن الكريم",
    });
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";

    const handlers: [MediaSessionAction, () => void][] = [
      [
        "play",
        () => {
          userPausedRef.current = false;
          audioRef.current?.play().catch(() => {});
        },
      ],
      [
        "pause",
        () => {
          userPausedRef.current = true;
          audioRef.current?.pause();
          playingRef.current = false;
          setPlaying(false);
        },
      ],
      ["nexttrack", () => jumpRef.current(1)],
      ["previoustrack", () => jumpRef.current(-1)],
      ["stop", () => stopRef.current()],
    ];
    handlers.forEach(([action, fn]) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn);
      } catch {
        // Ignore unsupported media session actions
      }
    });
    return () => {
      handlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore unsupported media session actions
        }
      });
    };
  }, [current, playing]);

  const loadAndPlay = useCallback(
    (track: Track) => {
      ensureAudioElements();
      userPausedRef.current = false;
      fallbackIdxRef.current = 0;
      playAyahAtIndex(track, track.ayahIndex, 0);
    },
    [ensureAudioElements, playAyahAtIndex]
  );

  const toggle = useCallback(() => {
    const el = audioRef.current;
    const c = currentRef.current;
    if (!el || !c) return;
    if (el.paused || !playingRef.current) {
      userPausedRef.current = false;
      playingRef.current = true;
      setPlaying(true);
      if (!el.src) {
        playAyahAtIndex(c, c.ayahIndex, fallbackIdxRef.current);
      } else {
        el.play().catch(() => {
          playAyahAtIndex(c, c.ayahIndex, fallbackIdxRef.current + 1);
        });
      }
    } else {
      userPausedRef.current = true;
      playingRef.current = false;
      setPlaying(false);
      el.pause();
    }
  }, [playAyahAtIndex]);

  const jump = useCallback(
    (delta: number) => {
      const c = currentRef.current;
      if (!c) return;
      userPausedRef.current = false;
      if (c.ayahIndex + delta >= c.playlist.length) {
        advanceContinuously();
        return;
      }
      const newIdx = Math.max(0, Math.min(c.playlist.length - 1, c.ayahIndex + delta));
      fallbackIdxRef.current = 0;
      playAyahAtIndex(c, newIdx, 0);
    },
    [advanceContinuously, playAyahAtIndex]
  );

  const stop = useCallback(() => {
    userPausedRef.current = true;
    playRequestIdRef.current++;
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
    }
    currentRef.current = null;
    playingRef.current = false;
    setCurrent(null);
    setPlaying(false);
  }, []);

  // Refs to call latest jump/stop from media session handlers
  const jumpRef = useRef(jump);
  const stopRef = useRef(stop);
  useEffect(() => {
    jumpRef.current = jump;
  }, [jump]);
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  return (
    <Ctx.Provider
      value={{
        current,
        playing,
        loadAndPlay,
        toggle,
        next: () => jump(1),
        prev: () => jump(-1),
        stop,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useQuranAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuranAudio must be used within QuranAudioProvider");
  return ctx;
}


