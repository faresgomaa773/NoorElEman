import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QuranAudioProvider } from "@/contexts/QuranAudioContext";
import { MiniPlayer } from "@/components/MiniPlayer";
import { prefetchPriorityRoutes } from "@/lib/route-prefetch";
import Index from "./pages/Index.tsx";

const Morning = lazy(() => import("./pages/Morning.tsx"));
const Evening = lazy(() => import("./pages/Evening.tsx"));
const Duas = lazy(() => import("./pages/Duas.tsx"));
const Favorites = lazy(() => import("./pages/Favorites.tsx"));
const Tasbih = lazy(() => import("./pages/Tasbih.tsx"));
const Quran = lazy(() => import("./pages/Quran.tsx"));
const Quiz = lazy(() => import("./pages/Quiz.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
  </div>
);

const App = () => {
  useEffect(() => {
    return prefetchPriorityRoutes(["/morning", "/evening", "/duas", "/favorites", "/quran", "/tasbih"]);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <QuranAudioProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* Morning Azkar & descriptive aliases */}
                <Route path="/morning" element={<Morning />} />
                <Route path="/azkar-al-sabah" element={<Morning />} />
                <Route path="/morning-azkar" element={<Morning />} />

                {/* Evening Azkar & descriptive aliases */}
                <Route path="/evening" element={<Evening />} />
                <Route path="/azkar-al-masaa" element={<Evening />} />
                <Route path="/evening-azkar" element={<Evening />} />

                {/* Duas, category slugs & descriptive aliases */}
                <Route path="/duas" element={<Duas />} />
                <Route path="/duas/:categorySlug" element={<Duas />} />
                <Route path="/islamic-duas" element={<Duas />} />

                {/* Favorites */}
                <Route path="/favorites" element={<Favorites />} />

                {/* Tasbih & descriptive aliases */}
                <Route path="/tasbih" element={<Tasbih />} />
                <Route path="/electronic-tasbih" element={<Tasbih />} />

                {/* Quran, Surah descriptive URLs & aliases */}
                <Route path="/quran" element={<Quran />} />
                <Route path="/quran/:surahSlug" element={<Quran />} />
                <Route path="/holy-quran" element={<Quran />} />

                {/* Quiz & descriptive aliases */}
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/islamic-quiz" element={<Quiz />} />

                {/* User & Admin routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <MiniPlayer />
          </BrowserRouter>
        </TooltipProvider>
      </QuranAudioProvider>
    </QueryClientProvider>
  );
};

export default App;
