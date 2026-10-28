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
    return prefetchPriorityRoutes(["/morning", "/evening", "/duas", "/quran", "/tasbih"]);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <QuranAudioProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/morning" element={<Morning />} />
                <Route path="/evening" element={<Evening />} />
                <Route path="/duas" element={<Duas />} />
                <Route path="/tasbih" element={<Tasbih />} />
                <Route path="/quran" element={<Quran />} />
                <Route path="/quiz" element={<Quiz />} />
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
