import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import {
  getFullSurahAudioUrls,
  getNextContinuousPlaybackTarget,
  getNextSurahNumber,
  getPrevSurahNumber,
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
  // Full surah stream (1 item) or multi-item playlist
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

function buildFullSurahTrack(
  surahNumber: number,
  reciterId: string,
  reciterName: string,
  surahName?: string
): Track {
  const candidates = getFullSurahAudioUrls(surahNumber, reciterId);
  const firstUrl = candidates[0] ?? "";
  return {
    surahName: surahName || `رقم ${surahNumber}`,
    surahNumber,
    ayahIndex: 0,
    totalAyahs: 1,
    audioUrl: firstUrl,
    reciterName,
    reciterId,
    playlist: [
      {
        numberInSurah: 1,
        audio: firstUrl,
        audioUrls: candidates,
      },
    ],
  };
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

    // Prepare the next surah full-audio track in cache
    if (nextIdx >= track.playlist.length - 1) {
      const nextSurahNum = getNextSurahNumber(track.surahNumber);
      const reciterId = track.reciterId || "ar.husary";
      const cacheKey = `${nextSurahNum}:${reciterId}`;
      if (prefetchedSurahRef.current?.key !== cacheKey) {
        const nextTrack = buildFullSurahTrack(nextSurahNum, reciterId, track.reciterName);
        prefetchedSurahRef.current = { key: cacheKey, track: nextTrack };
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

    // Reached the end of the current surah: automatically continue to the next surah full audio
    const reciterId = c.reciterId || "ar.husary";
    const cacheKey = `${target.surahNumber}:${reciterId}`;
    const cached = prefetchedSurahRef.current;
    if (cached && cached.key === cacheKey) {
      fallbackIdxRef.current = 0;
      playAyahAtIndex(cached.track, 0, 0);
      return;
    }

    const nextSurahTrack = buildFullSurahTrack(target.surahNumber, reciterId, c.reciterName);
    prefetchedSurahRef.current = { key: cacheKey, track: nextSurahTrack };
    fallbackIdxRef.current = 0;
    playAyahAtIndex(nextSurahTrack, 0, 0);
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
      if (userPausedRef.current) {
        playingRef.current = false;
        setPlaying(false);
      }
    };

    const onTimeUpdate = () => {
      const c = currentRef.current;
      if (!c || userPausedRef.current) return;
      // Only use early-advance when stepping through multi-item playlists;
      // for a single full-surah MP3 stream (playlist.length <= 1), let it play naturally to the end.
      if (c.playlist.length <= 1) return;
      const reqId = playRequestIdRef.current;
      if (earlyAdvancedRequestIdRef.current === reqId) return;

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
      title:
        current.playlist.length > 1
          ? `سورة ${current.surahName} • آية ${current.ayahIndex + 1}/${current.totalAyahs}`
          : `تلاوة سورة ${current.surahName} كاملة`,
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
      // When playing a single full-surah audio stream, next/prev switches to the next/previous surah
      if (c.playlist.length <= 1) {
        const reciterId = c.reciterId || "ar.husary";
        const targetSurahNum =
          delta >= 0 ? getNextSurahNumber(c.surahNumber) : getPrevSurahNumber(c.surahNumber);
        const targetTrack = buildFullSurahTrack(targetSurahNum, reciterId, c.reciterName);
        fallbackIdxRef.current = 0;
        playAyahAtIndex(targetTrack, 0, 0);
        return;
      }
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


