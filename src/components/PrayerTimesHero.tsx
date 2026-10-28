import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  Loader2,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudSun,
  RefreshCw,
  Calendar,
} from "lucide-react";

interface Timings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface ApiData {
  timings: Timings;
  date: {
    readable: string;
    hijri: { date: string; month: { ar: string }; year: string; weekday: { ar: string } };
  };
}

const PRAYERS: { key: keyof Timings; ar: string; icon: typeof Sun }[] = [
  { key: "Fajr", ar: "الفجر", icon: Sunrise },
  { key: "Sunrise", ar: "الشروق", icon: Sun },
  { key: "Dhuhr", ar: "الظهر", icon: CloudSun },
  { key: "Asr", ar: "العصر", icon: Sun },
  { key: "Maghrib", ar: "المغرب", icon: Sunset },
  { key: "Isha", ar: "العشاء", icon: Moon },
];

const COUNTABLE = PRAYERS.filter((p) => p.key !== "Sunrise");

const parseHoursMinutes = (t: string): [number, number] => {
  const clean = t.trim().split(" ")[0];
  const [h, m] = clean.split(":").map(Number);
  return [Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0];
};

const fmt = (t: string) => {
  const [h, m] = parseHoursMinutes(t);
  const p = h >= 12 ? "م" : "ص";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${p}`;
};

const getNext = (t: Timings) => {
  const now = new Date();
  const cur = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  for (const p of COUNTABLE) {
    const [h, m] = parseHoursMinutes(t[p.key]);
    if (h * 3600 + m * 60 > cur) return p;
  }
  return COUNTABLE[0];
};

const secondsUntil = (target: string) => {
  const [h, m] = parseHoursMinutes(target);
  const now = new Date();
  let secs =
    h * 3600 + m * 60 - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
  if (secs < 0) secs += 24 * 3600;
  return secs;
};

const pad = (n: number) => n.toString().padStart(2, "0");

export function PrayerTimesHero() {
  const [data, setData] = useState<ApiData | null>(null);
  const [city, setCity] = useState("موقعك");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // 1s ticker for live countdown
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchByCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=5`
      );
      const json = await res.json();
      if (json.code === 200) setData(json.data);
      else throw new Error("failed");
      try {
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`
        );
        const g = await geo.json();
        setCity(
          g.address?.city ||
            g.address?.town ||
            g.address?.state ||
            g.address?.country ||
            "موقعك"
        );
      } catch {
        // Keep existing city label if reverse geocoding fails
      }
    } catch {
      setError("تعذّر تحميل المواقيت");
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      fetchByCoords(21.4225, 39.8262);
      setCity("مكة المكرمة");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        fetchByCoords(21.4225, 39.8262);
        setCity("مكة المكرمة");
      },
      { timeout: 8000 }
    );
  }, [fetchByCoords]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const next = data ? getNext(data.timings) : null;
  const secs = data && next ? secondsUntil(data.timings[next.key]) : 0;
  const hh = Math.floor(secs / 3600);
  const mm = Math.floor((secs % 3600) / 60);
  const ss = secs % 60;

  // Daily progress between previous and next prayer
  const progress = (() => {
    if (!data || !next) return 0;
    const idx = COUNTABLE.findIndex((p) => p.key === next.key);
    const prev = idx === 0 ? COUNTABLE[COUNTABLE.length - 1] : COUNTABLE[idx - 1];
    const toSec = (t: string) => {
      const [h, m] = parseHoursMinutes(t);
      return h * 3600 + m * 60;
    };
    const now = new Date();
    const cur =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const prevSec = toSec(data.timings[prev.key]);
    let nextSec = toSec(data.timings[next.key]);
    if (nextSec <= prevSec) nextSec += 24 * 3600;
    let c = cur;
    if (c < prevSec) c += 24 * 3600;
    const p = ((c - prevSec) / (nextSec - prevSec)) * 100;
    return Math.max(0, Math.min(100, p));
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-emerald p-1 shadow-glow"
    >
      <div className="rounded-[calc(1.5rem-4px)] bg-card p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-emerald shadow-glow">
              <Clock className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight mb-0">
                مواقيت الصلاة
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{city}</span>
                {data && (
                  <>
                    <span className="opacity-40">•</span>
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {data.date.hijri.date} {data.date.hijri.month.ar}{" "}
                      {data.date.hijri.year} هـ
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={requestLocation}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-smooth"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm">جارٍ تحديد موقعك وتحميل المواقيت...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4 text-sm">{error}</p>
            <button
              onClick={requestLocation}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4" /> إعادة المحاولة
            </button>
          </div>
        ) : data && next ? (
          <>
            {/* Countdown hero */}
            <div className="relative rounded-3xl bg-gradient-emerald text-primary-foreground p-7 md:p-10 mb-8 shadow-medium overflow-hidden">
              <div className="absolute inset-0 pattern-arabesque opacity-10" />
              <div className="relative text-center">
                <p className="text-[11px] md:text-xs uppercase tracking-[0.2em] opacity-90 mb-2">
                  الصلاة القادمة
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={next.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="font-display text-4xl md:text-5xl font-bold mb-2"
                  >
                    {next.ar}
                  </motion.p>
                </AnimatePresence>
                <p className="text-accent font-semibold text-lg md:text-xl mb-6">
                  {fmt(data.timings[next.key])}
                </p>

                {/* Live countdown */}
                <div
                  className="flex items-center justify-center gap-2 md:gap-3 mb-6"
                  dir="ltr"
                >
                  {[
                    { v: hh, l: "ساعة" },
                    { v: mm, l: "دقيقة" },
                    { v: ss, l: "ثانية" },
                  ].map((u, i) => (
                    <div key={i} className="flex items-center gap-2 md:gap-3">
                      <div className="flex flex-col items-center">
                        <div className="min-w-[3.75rem] md:min-w-[5rem] rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-3 md:py-4 font-mono text-3xl md:text-4xl font-bold tabular-nums shadow-soft">
                          {pad(u.v)}
                        </div>
                        <span className="text-[10px] md:text-xs mt-2 opacity-85 tracking-wider">
                          {u.l}
                        </span>
                      </div>
                      {i < 2 && (
                        <span className="text-3xl md:text-4xl font-bold opacity-50 -mt-6">
                          :
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mx-auto max-w-md">
                  <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[10px] md:text-xs opacity-75 mt-2">
                    {Math.round(progress)}% من الوقت بين الصلاتين
                  </p>
                </div>
              </div>
            </div>

            {/* All prayers grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {PRAYERS.map((p, idx) => {
                const Icon = p.icon;
                const active = next.key === p.key;
                return (
                  <motion.div
                    key={p.key}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    className={`relative rounded-2xl p-4 transition-smooth border ${
                      active
                        ? "bg-primary/10 border-primary/40 shadow-medium"
                        : "bg-muted/40 border-transparent hover:bg-muted/70 hover:border-border"
                    }`}
                  >
                    {active && (
                      <span className="absolute top-2 left-2 inline-flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                    )}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${
                        active
                          ? "bg-gradient-emerald text-primary-foreground shadow-soft"
                          : "bg-background text-primary"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p
                      className={`font-display text-sm font-bold mb-1 ${
                        active ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {p.ar}
                    </p>
                    <p
                      className={`text-sm font-mono tabular-nums ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {fmt(data.timings[p.key])}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-6 leading-relaxed">
              المواقيت محسوبة وفق طريقة جامعة أم القرى — قد تختلف بضع دقائق عن المساجد المحلية.
            </p>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}
