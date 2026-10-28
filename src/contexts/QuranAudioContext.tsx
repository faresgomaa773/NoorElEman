import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";

interface Track {
  surahName: string;
  surahNumber: number;
  ayahIndex: number;
  totalAyahs: number;
  audioUrl: string;
  reciterName: string;
  // Full ayah list to advance
  playlist: { audio?: string }[];
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

export function QuranAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentRef = useRef<Track | null>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);

  // Keep a ref synced with current for stable handlers
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // Initialize audio element once with background-friendly settings
  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      // Allow background playback on mobile browsers
      a.setAttribute("playsinline", "");
      audioRef.current = a;
    }
    const el = audioRef.current;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      const c = currentRef.current;
      if (!c) return;
      const nextIdx = c.ayahIndex + 1;
      if (nextIdx >= c.playlist.length) {
        setPlaying(false);
        return;
      }
      const nextUrl = c.playlist[nextIdx]?.audio;
      if (!nextUrl) {
        setPlaying(false);
        return;
      }
      el.src = nextUrl;
      el.play().catch(() => {});
      setCurrent({ ...c, ayahIndex: nextIdx, audioUrl: nextUrl });
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);

    // Resume audio if browser/tab pauses it on visibility change
    const onVisibility = () => {
      if (!document.hidden && currentRef.current && el.paused && playing) {
        el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      ["play", () => audioRef.current?.play().catch(() => {})],
      ["pause", () => audioRef.current?.pause()],
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

  const loadAndPlay = useCallback((track: Track) => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      a.setAttribute("playsinline", "");
      audioRef.current = a;
    }
    audioRef.current.src = track.audioUrl;
    audioRef.current.play().catch(() => {});
    setCurrent(track);
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el || !currentRef.current) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, []);

  const jump = useCallback((delta: number) => {
    const c = currentRef.current;
    const el = audioRef.current;
    if (!c || !el) return;
    const newIdx = Math.max(0, Math.min(c.playlist.length - 1, c.ayahIndex + delta));
    const url = c.playlist[newIdx]?.audio;
    if (!url) return;
    el.src = url;
    el.play().catch(() => {});
    setCurrent({ ...c, ayahIndex: newIdx, audioUrl: url });
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    setCurrent(null);
    setPlaying(false);
  }, []);

  // Refs to call latest jump/stop from media session handlers
  const jumpRef = useRef(jump);
  const stopRef = useRef(stop);
  useEffect(() => { jumpRef.current = jump; }, [jump]);
  useEffect(() => { stopRef.current = stop; }, [stop]);

  return (
    <Ctx.Provider value={{ current, playing, loadAndPlay, toggle, next: () => jump(1), prev: () => jump(-1), stop }}>
      {children}
    </Ctx.Provider>
  );
}

export function useQuranAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuranAudio must be used within QuranAudioProvider");
  return ctx;
}
