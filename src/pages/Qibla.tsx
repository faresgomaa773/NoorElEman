import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass, MapPin, Loader2, Navigation, RefreshCw, Smartphone } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const KAABA = { lat: 21.4225, lon: 39.8262 };

const calcQiblaBearing = (lat: number, lon: number) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lon - lon);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
};

const haversineKm = (lat: number, lon: number) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(KAABA.lat - lat);
  const dLon = toRad(KAABA.lon - lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Qibla = () => {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compassEnabled, setCompassEnabled] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("متصفحك لا يدعم تحديد الموقع.");
      setLoading(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setQiblaBearing(calcQiblaBearing(lat, lon));
        setError(null);
        setLoading(false);
      },
      () => {
        toast({ title: "تعذّر تحديد موقعك", description: "تأكد من السماح بالوصول للموقع." });
        setError("تعذّر تحديد موقعك. الرجاء السماح بالوصول للموقع.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const enableCompass = async () => {
    const DOE = (
      window as Window & {
        DeviceOrientationEvent?: typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<string>;
        };
      }
    ).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") {
      try {
        const res = await DOE.requestPermission();
        if (res !== "granted") {
          toast({ title: "تم رفض إذن البوصلة" });
          return;
        }
      } catch {
        toast({ title: "تعذّر تفعيل البوصلة" });
        return;
      }
    }
    const handler = (e: Event) => {
      const orientEvent = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
      const webkit = orientEvent.webkitCompassHeading;
      if (typeof webkit === "number") setHeading(webkit);
      else if (orientEvent.alpha !== null) setHeading(360 - orientEvent.alpha);
    };
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    setCompassEnabled(true);
    toast({ title: "تم تفعيل البوصلة", description: "وجّه هاتفك بشكل أفقي للحصول على دقة أفضل." });
  };

  const arrowAngle = qiblaBearing !== null && heading !== null ? qiblaBearing - heading : qiblaBearing || 0;
  const aligned = heading !== null && qiblaBearing !== null && Math.abs(((qiblaBearing - heading + 540) % 360) - 180) < 5;

  return (
    <Layout>
      <SEO
        title="اتجاه القبلة | بوصلة الكعبة | نور الإيمان"
        description="حدّد اتجاه القبلة من موقعك الحالي ببوصلة تفاعلية دقيقة، مع حساب المسافة إلى الكعبة المشرّفة."
        keywords="اتجاه القبلة, بوصلة القبلة, الكعبة, مكة, نور الإيمان"
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 text-primary-foreground py-16">
        <div className="absolute inset-0 pattern-arabesque opacity-20" />
        <div className="container relative text-center">
          <Compass className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">اتجاه القبلة</h1>
          <p className="text-primary-foreground/85">حدّد اتجاه الكعبة المشرّفة من موقعك</p>
        </div>
      </section>

      <section className="container py-12 max-w-2xl">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>جارٍ تحديد موقعك...</p>
          </div>
        )}

        {error && !loading && (
          <Card className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={requestLocation} variant="emerald">
              <RefreshCw className="h-4 w-4" /> إعادة المحاولة
            </Button>
          </Card>
        )}

        {coords && qiblaBearing !== null && !loading && (
          <>
            <Card className="p-8 bg-gradient-card mb-6">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto">
                {/* Compass dial */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-border bg-background shadow-medium transition-transform duration-300"
                  style={{ transform: heading !== null ? `rotate(${-heading}deg)` : "none" }}
                >
                  {/* Cardinal points */}
                  {[
                    { l: "ش", a: 0, color: "text-destructive" },
                    { l: "ق", a: 90 },
                    { l: "ج", a: 180 },
                    { l: "غ", a: 270 },
                  ].map((p) => (
                    <div
                      key={p.a}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ transform: `translate(-50%, -50%) rotate(${p.a}deg) translateY(-130px) rotate(${-p.a}deg)` }}
                    >
                      <span className={`font-display font-bold text-lg ${p.color || "text-foreground"}`}>{p.l}</span>
                    </div>
                  ))}
                  {/* Tick marks */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 origin-bottom h-3 w-0.5 bg-muted-foreground/40"
                      style={{ transform: `translate(-50%, -100%) rotate(${i * 15}deg) translateY(-138px)` }}
                    />
                  ))}
                </div>

                {/* Qibla arrow */}
                <motion.div
                  className="absolute inset-0 flex items-start justify-center pt-4"
                  animate={{ rotate: arrowAngle }}
                  transition={{ type: "spring", damping: 18, stiffness: 90 }}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-0 h-0 border-l-[14px] border-r-[14px] border-b-[28px] border-l-transparent border-r-transparent ${aligned ? "border-b-success" : "border-b-accent"}`} />
                    <div className={`w-1.5 h-28 ${aligned ? "bg-success" : "bg-accent"} rounded-b`} />
                  </div>
                </motion.div>

                {/* Center Kaaba */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-foreground border-4 border-accent shadow-glow flex items-center justify-center">
                  <span className="text-accent text-2xl">🕋</span>
                </div>
              </div>

              <div className="text-center mt-6 space-y-2">
                {aligned ? (
                  <p className="font-display text-xl font-bold text-success">أنت موجّه نحو القبلة ✓</p>
                ) : (
                  <p className="text-muted-foreground">أدر هاتفك حتى يتحاذى السهم مع الكعبة</p>
                )}
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Navigation className="h-3.5 w-3.5" />
                    اتجاه القبلة: <strong className="text-foreground">{Math.round(qiblaBearing)}°</strong>
                  </span>
                  <span>المسافة: <strong className="text-foreground">{Math.round(haversineKm(coords.lat, coords.lon))} كم</strong></span>
                </div>
              </div>
            </Card>

            {!compassEnabled && (
              <Card className="p-5 bg-accent/10 border-accent/30">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">فعّل البوصلة لتحديد دقيق</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      على الهاتف، فعّل بوصلة الجهاز ليتحرك السهم حسب اتجاهك مباشرة.
                    </p>
                    <Button onClick={enableCompass} variant="emerald" size="sm">
                      <Compass className="h-4 w-4" /> تفعيل البوصلة
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex items-center justify-between gap-3 mt-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {coords.lat.toFixed(3)}, {coords.lon.toFixed(3)}
              </div>
              <Button onClick={requestLocation} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" /> تحديث الموقع
              </Button>
            </div>
          </>
        )}
      </section>
    </Layout>
  );
};

export default Qibla;
