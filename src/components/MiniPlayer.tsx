import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuranAudio } from "@/contexts/QuranAudioContext";

export function MiniPlayer() {
  const { current, playing, toggle, next, prev, stop } = useQuranAudio();

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 220 }}
          className="fixed bottom-4 inset-x-2 sm:inset-x-auto sm:right-4 sm:left-auto z-[60] sm:max-w-md"
        >
          <div className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-glow p-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-emerald shrink-0">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm text-foreground truncate">سورة {current.surahName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {current.reciterName} • آية {current.ayahIndex + 1}/{current.totalAyahs}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={prev} aria-label="السابق">
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="emerald" className="h-9 w-9" onClick={toggle} aria-label={playing ? "إيقاف" : "تشغيل"}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={next} aria-label="التالي">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={stop} aria-label="إغلاق">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
