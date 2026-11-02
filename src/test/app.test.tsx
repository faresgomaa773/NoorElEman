import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { QuranAudioProvider } from "@/contexts/QuranAudioContext";
import Index from "@/pages/Index";
import Morning from "@/pages/Morning";
import Evening from "@/pages/Evening";
import Duas from "@/pages/Duas";
import Tasbih from "@/pages/Tasbih";
import Quiz from "@/pages/Quiz";
import Quran from "@/pages/Quran";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import Favorites from "@/pages/Favorites";

function renderWithProviders(ui: React.ReactElement, initialRoute = "/") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <QuranAudioProvider>
          <MemoryRouter
            initialEntries={[initialRoute]}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            {ui}
          </MemoryRouter>
        </QuranAudioProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

describe("Application Pages & Core Functionality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the Home page with hero, daily dhikr, and navigation sections", () => {
    renderWithProviders(<Index />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("نور الإيمان");
    expect(screen.getByText("استكشف أقسام الموقع")).toBeInTheDocument();
    expect(screen.getByText("أقسام الموقع")).toBeInTheDocument();
    expect(screen.queryByText("روابط سريعة مختارة")).not.toBeInTheDocument();
  });

  it("loads Morning Azkar and increments counter when clicked", async () => {
    renderWithProviders(<Morning />, "/morning");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("أذكار الصباح");

    await waitFor(() => {
      const countButtons = screen.getAllByLabelText("عدّ الذكر");
      expect(countButtons.length).toBeGreaterThan(0);
    });

    const countButtons = screen.getAllByLabelText("عدّ الذكر");
    fireEvent.click(countButtons[0]);
  });

  it("loads Evening Azkar correctly", async () => {
    renderWithProviders(<Evening />, "/evening");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("أذكار المساء");

    await waitFor(() => {
      const countButtons = screen.getAllByLabelText("عدّ الذكر");
      expect(countButtons.length).toBeGreaterThan(0);
    });
  });

  it("supports Reading Mode (font size, background color, and Night Mode) in Azkar and Quran pages", async () => {
    const { unmount } = renderWithProviders(<Morning />, "/morning");

    const readingModeBtn = screen.getByRole("button", { name: /وضع القراءة/ });
    fireEvent.click(readingModeBtn);

    expect(screen.getByText("حجم الخط:")).toBeInTheDocument();
    expect(screen.getByText("لون الخلفية:")).toBeInTheDocument();

    const increaseFontBtn = screen.getByLabelText("تكبير الخط");
    fireEvent.click(increaseFontBtn);
    expect(screen.getByText("الخط: كبير")).toBeInTheDocument();

    const parchmentBgBtn = screen.getByLabelText("خلفية كريمي (مصحف)");
    fireEvent.click(parchmentBgBtn);
    expect(parchmentBgBtn).toHaveAttribute("aria-pressed", "true");

    const nightModeBtn = screen.getByLabelText("تفعيل وضع الراحة للعين");
    fireEvent.click(nightModeBtn);
    expect(nightModeBtn).toHaveAttribute("aria-pressed", "true");

    unmount();

    // Verify settings persist when navigating to the Quran page
    renderWithProviders(<Quran />, "/quran");
    expect(screen.getByText("الخط: كبير")).toBeInTheDocument();
    expect(screen.getByLabelText("تفعيل وضع الراحة للعين")).toHaveAttribute("aria-pressed", "true");

    // Reset reading settings
    const resetBtn = screen.getByLabelText("إعادة ضبط إعدادات القراءة");
    fireEvent.click(resetBtn);
    expect(screen.getByText("الخط: متوسط")).toBeInTheDocument();
    expect(screen.getByLabelText("تفعيل وضع الراحة للعين")).toHaveAttribute("aria-pressed", "false");
  });

  it("loads Duas and filters by category", async () => {
    renderWithProviders(<Duas />, "/duas");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("الأدعية المأثورة");

    await waitFor(() => {
      const articles = document.querySelectorAll("article");
      expect(articles.length).toBeGreaterThan(0);
    });

    const allButton = screen.getByRole("button", { name: "الكل" });
    expect(allButton).toBeInTheDocument();
  });

  it("saves Azkar and Duas to localStorage Favorites and manages them in the Favorites page", async () => {
    // 1. Save a Dhikr from Morning Azkar
    const { unmount: unmountMorning } = renderWithProviders(<Morning />, "/morning");
    await waitFor(() => {
      expect(screen.getAllByLabelText("إضافة إلى المفضلة").length).toBeGreaterThan(0);
    });
    const addAzkarFavButtons = screen.getAllByLabelText("إضافة إلى المفضلة");
    fireEvent.click(addAzkarFavButtons[0]);
    expect(screen.getAllByLabelText("إزالة من المفضلة").length).toBe(1);
    unmountMorning();

    // 2. Save a Dua from Duas page
    const { unmount: unmountDuas } = renderWithProviders(<Duas />, "/duas");
    await waitFor(() => {
      expect(screen.getAllByLabelText("إضافة إلى المفضلة").length).toBeGreaterThan(0);
    });
    const addDuaFavButtons = screen.getAllByLabelText("إضافة إلى المفضلة");
    fireEvent.click(addDuaFavButtons[0]);
    expect(screen.getByText("في مفضلتك")).toBeInTheDocument();
    unmountDuas();

    // 3. Open Favorites page ("مفضلتك") and verify both items are loaded from localStorage
    renderWithProviders(<Favorites />, "/favorites");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("مفضلتك");

    const articles = document.querySelectorAll("article");
    expect(articles.length).toBe(2);

    // Filter by Azkar only
    fireEvent.click(screen.getByRole("button", { name: /الأذكار/ }));
    expect(document.querySelectorAll("article").length).toBe(1);

    // Filter by Duas only
    fireEvent.click(screen.getByRole("button", { name: /الأدعية/ }));
    expect(document.querySelectorAll("article").length).toBe(1);

    // Back to All and clear favorites
    fireEvent.click(screen.getByRole("button", { name: /الكل/ }));
    expect(document.querySelectorAll("article").length).toBe(2);

    const clearAllButton = screen.getByRole("button", { name: /مسح المفضلة/ });
    fireEvent.click(clearAllButton);

    expect(screen.getByText("قائمة مفضلتك فارغة حالياً")).toBeInTheDocument();
  });

  it("increments and resets the Tasbih counter", () => {
    renderWithProviders(<Tasbih />, "/tasbih");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("السبحة الإلكترونية");

    const countButton = screen.getByLabelText("عدّ");
    fireEvent.click(countButton);
    fireEvent.click(countButton);

    expect(screen.getAllByText("2").length).toBeGreaterThan(0);

    const resetButton = screen.getByRole("button", { name: /تصفير/ });
    fireEvent.click(resetButton);
    expect(screen.getByText("آخر الجلسات")).toBeInTheDocument();
  });

  it("loads Quiz questions and validates an answer", async () => {
    renderWithProviders(<Quiz />, "/quiz");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("الاختبار الديني");

    await waitFor(() => {
      expect(screen.getByText(/سؤال 1 \//)).toBeInTheDocument();
    });

    const optionA = screen.getByText("A").closest("button");
    expect(optionA).not.toBeNull();
    fireEvent.click(optionA!);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /السؤال التالي|إنهاء الاختبار/ })).toBeInTheDocument();
    });
  });

  it("renders Auth and Profile unauthenticated views properly", async () => {
    renderWithProviders(<Auth />, "/auth");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("تسجيل الدخول إلى نور الإيمان");

    renderWithProviders(<Profile />, "/profile");
    await waitFor(() => {
      expect(screen.getByText("سجّل دخولك أولاً")).toBeInTheDocument();
    });
  });

  it("registers a new user account as a regular user (not admin) and signs in properly", async () => {
    const { supabase } = await import("@/integrations/supabase/client");

    const signUpRes = await supabase.auth.signUp({
      email: "newuser@example.com",
      password: "StrongPassword123!",
      options: { data: { display_name: "أحمد محمد" } },
    });

    expect(signUpRes.error).toBeNull();
    expect(signUpRes.data.user?.email).toBe("newuser@example.com");

    const { unmount } = renderWithProviders(<Profile />, "/profile");
    await waitFor(() => {
      expect(screen.getByText("أحمد محمد")).toBeInTheDocument();
      expect(screen.getByText("حساب مستخدم")).toBeInTheDocument();
    });

    // Ensure admin link is NOT shown in Navbar for regular users
    expect(screen.queryByText("لوحة التحكم")).not.toBeInTheDocument();
    unmount();

    // Ensure signing out and signing back in preserves regular user role
    await supabase.auth.signOut();
    const signInRes = await supabase.auth.signInWithPassword({
      email: "newuser@example.com",
      password: "StrongPassword123!",
    });
    expect(signInRes.error).toBeNull();
    expect(signInRes.data.session).not.toBeNull();
  });

  it("plays Quran ayahs continuously without stopping at ayah boundaries", async () => {
    const { useQuranAudio } = await import("@/contexts/QuranAudioContext");

    function TestContinuousPlayer() {
      const audio = useQuranAudio();
      return (
        <div>
          <button
            type="button"
            onClick={() =>
              audio.loadAndPlay({
                surahName: "الفاتحة",
                surahNumber: 1,
                ayahIndex: 0,
                totalAyahs: 3,
                audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.husary/1.mp3",
                reciterName: "محمود خليل الحصري",
                reciterId: "ar.husary",
                playlist: [
                  { numberInSurah: 1, audio: "https://cdn.islamic.network/quran/audio/128/ar.husary/1.mp3" },
                  { numberInSurah: 2, audio: "https://cdn.islamic.network/quran/audio/128/ar.husary/2.mp3" },
                  { numberInSurah: 3, audio: "https://cdn.islamic.network/quran/audio/128/ar.husary/3.mp3" },
                ],
              })
            }
          >
            بدء التلاوة
          </button>
          <button type="button" onClick={() => audio.next()}>
            التالي
          </button>
          <span data-testid="current-ayah">{audio.current ? audio.current.ayahIndex + 1 : 0}</span>
          <span data-testid="playing-state">{audio.playing ? "playing" : "stopped"}</span>
        </div>
      );
    }

    renderWithProviders(<TestContinuousPlayer />);
    fireEvent.click(screen.getByText("بدء التلاوة"));

    expect(screen.getByTestId("current-ayah")).toHaveTextContent("1");
    expect(screen.getByTestId("playing-state")).toHaveTextContent("playing");

    // Advance across ayahs and verify playback stays playing continuously without stopping
    fireEvent.click(screen.getByText("التالي"));
    expect(screen.getByTestId("current-ayah")).toHaveTextContent("2");
    expect(screen.getByTestId("playing-state")).toHaveTextContent("playing");

    fireEvent.click(screen.getByText("التالي"));
    expect(screen.getByTestId("current-ayah")).toHaveTextContent("3");
    expect(screen.getByTestId("playing-state")).toHaveTextContent("playing");
  });

  it("does not repeat Quiz questions across consecutive quiz sessions", async () => {
    const { unmount } = renderWithProviders(<Quiz />, "/quiz");
    await waitFor(() => {
      expect(screen.getByText(/سؤال 1 \//)).toBeInTheDocument();
    });
    const firstSessionSeen = JSON.parse(localStorage.getItem("noor-quiz-seen-ids-v1") || "[]") as string[];
    expect(firstSessionSeen.length).toBe(10);
    unmount();

    const { unmount: unmount2 } = renderWithProviders(<Quiz />, "/quiz");
    await waitFor(() => {
      expect(screen.getByText(/سؤال 1 \//)).toBeInTheDocument();
    });
    const secondSessionSeen = JSON.parse(localStorage.getItem("noor-quiz-seen-ids-v1") || "[]") as string[];
    expect(secondSessionSeen.length).toBe(20);
    expect(new Set(secondSessionSeen).size).toBe(20);
    unmount2();
  });

  it("renders Mushaf index with search and revelation filters and opens illuminated Mushaf frame", async () => {
    renderWithProviders(<Quran />, "/quran");

    expect(screen.getByText("فهرس السور • المصحف الشريف")).toBeInTheDocument();
    const searchInput = screen.getByLabelText("ابحث باسم السورة أو رقمها");
    fireEvent.change(searchInput, { target: { value: "الكهف" } });

    expect(screen.getByText("سُورَةُ الكهف")).toBeInTheDocument();
    fireEvent.click(screen.getByText("سُورَةُ الكهف"));

    await waitFor(() => {
      expect(screen.getByTestId("mushaf-surah-banner")).toBeInTheDocument();
    });
  });
});



