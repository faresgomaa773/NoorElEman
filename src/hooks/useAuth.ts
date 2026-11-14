import { useCallback, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const REGULAR_SIGNUP_USERS_KEY = "al_noor_regular_signup_users_v1";
const OWNER_ADMIN_EMAILS = new Set(["faresgomaa773@gmail.com"]);
const AUTH_SYNC_EVENT = "al-noor-auth-sync";

function getRegularSignupUsers(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(REGULAR_SIGNUP_USERS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

export function markUserAsRegularSignup(userId: string, email?: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  if (email && OWNER_ADMIN_EMAILS.has(email.trim().toLowerCase())) return;
  try {
    const set = getRegularSignupUsers();
    set.add(userId);
    localStorage.setItem(REGULAR_SIGNUP_USERS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage errors
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return Boolean(localStorage.getItem("al_noor_local_db_session"));
    } catch {
      return false;
    }
  });

  const checkAdmin = useCallback(async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser) {
      setIsAdmin((prev) => (prev ? false : prev));
      return false;
    }

    const email = currentUser.email?.trim().toLowerCase() ?? "";

    // If this account was created as a regular user signup (and is not the site owner),
    // never grant admin privileges automatically.
    const regularUsers = getRegularSignupUsers();
    if (regularUsers.has(currentUser.id) && !OWNER_ADMIN_EMAILS.has(email)) {
      setIsAdmin((prev) => (prev ? false : prev));
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error || !data) {
        setIsAdmin((prev) => (prev ? false : prev));
        return false;
      }

      setIsAdmin((prev) => (prev ? prev : true));
      return true;
    } catch {
      setIsAdmin((prev) => (prev ? false : prev));
      return false;
    }
  }, []);

  const syncSession = useCallback(
    async (nextSession: Session | null) => {
      const nextUser = nextSession?.user ?? null;
      setSession((prev) => (prev?.access_token === nextSession?.access_token ? prev : nextSession));
      setUser((prev) => (prev?.id === nextUser?.id ? prev : nextUser));
      if (nextUser) {
        await checkAdmin(nextUser);
      } else {
        setIsAdmin((prev) => (prev ? false : prev));
      }
      setLoading((prev) => (prev ? false : prev));
    },
    [checkAdmin]
  );

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      void syncSession(newSession);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      void syncSession(currentSession);
    });

    const handleCustomSync = () => {
      if (!mounted) return;
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (!mounted) return;
        void syncSession(currentSession);
      });
    };

    window.addEventListener(AUTH_SYNC_EVENT, handleCustomSync);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(AUTH_SYNC_EVENT, handleCustomSync);
    };
  }, [syncSession]);

  const signOut = useCallback(async () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(AUTH_SYNC_EVENT));
    }
  }, []);

  return { user, session, isAdmin, loading, signOut };
}
