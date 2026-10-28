import { createClient, type SupabaseClient, type Session, type User } from "@supabase/supabase-js";
import type { Database } from "./types";
import { brokeredPreviewStorage } from "./previewAuthStorage";
import { DEFAULT_AZKAR, DEFAULT_DUAS, DEFAULT_QUESTIONS } from "@/data/islamicData";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

type TableName = keyof Database["public"]["Tables"];

interface StoredAccount {
  id: string;
  email: string;
  password: string;
  display_name: string;
}

const STORAGE_PREFIX = "al_noor_local_db_";

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

function getTableRows(table: TableName): Record<string, unknown>[] {
  switch (table) {
    case "azkar":
      return readStore("azkar", DEFAULT_AZKAR) as unknown as Record<string, unknown>[];
    case "duas":
      return readStore("duas", DEFAULT_DUAS) as unknown as Record<string, unknown>[];
    case "questions":
      return readStore("questions", DEFAULT_QUESTIONS) as unknown as Record<string, unknown>[];
    case "profiles":
      return readStore("profiles", []);
    case "quiz_attempts":
      return readStore("quiz_attempts", []);
    case "user_roles":
      return readStore("user_roles", []);
    default:
      return [];
  }
}

function setTableRows(table: TableName, rows: Record<string, unknown>[]): void {
  writeStore(table, rows);
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}

function createLocalFallbackClient(): SupabaseClient<Database> {
  type AuthListener = (event: string, session: Session | null) => void;
  const listeners = new Set<AuthListener>();

  const getCurrentSession = (): Session | null => {
    return readStore<Session | null>("session", null);
  };

  const notifyAuth = (event: string, session: Session | null) => {
    listeners.forEach((cb) => {
      try {
        cb(event, session);
      } catch {
        // Ignore callback errors
      }
    });
  };

  const buildSession = (account: StoredAccount): Session => {
    const nowSec = Math.floor(Date.now() / 1000);
    const user: User = {
      id: account.id,
      app_metadata: {},
      user_metadata: { display_name: account.display_name },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: account.email,
    };
    return {
      access_token: "local-token-" + account.id,
      refresh_token: "local-refresh-" + account.id,
      expires_in: 3600 * 24 * 7,
      expires_at: nowSec + 3600 * 24 * 7,
      token_type: "bearer",
      user,
    };
  };

  const createQueryBuilder = (table: TableName) => {
    let op: "select" | "insert" | "update" | "delete" = "select";
    let payloadData: Record<string, unknown> | Record<string, unknown>[] | null = null;
    const filters: Array<(row: Record<string, unknown>) => boolean> = [];
    let orderCol: string | null = null;
    let orderAsc = true;
    let singleMode = false;

    const execute = async (): Promise<{ data: unknown; error: null | { message: string } }> => {
      const nowIso = new Date().toISOString();
      let rows = [...getTableRows(table)];

      if (op === "insert" && payloadData) {
        const items = Array.isArray(payloadData) ? payloadData : [payloadData];
        const inserted = items.map((item) => ({
          id: (item.id as string) || makeId(),
          created_at: nowIso,
          updated_at: nowIso,
          ...item,
        }));
        rows.push(...inserted);
        setTableRows(table, rows);
        return { data: singleMode ? inserted[0] ?? null : inserted, error: null };
      }

      if (op === "update" && payloadData && !Array.isArray(payloadData)) {
        const updated: Record<string, unknown>[] = [];
        rows = rows.map((row) => {
          if (filters.every((fn) => fn(row))) {
            const next = { ...row, ...payloadData, updated_at: nowIso };
            updated.push(next);
            return next;
          }
          return row;
        });
        setTableRows(table, rows);
        return { data: singleMode ? updated[0] ?? null : updated, error: null };
      }

      if (op === "delete") {
        const remaining = rows.filter((row) => !filters.every((fn) => fn(row)));
        setTableRows(table, remaining);
        return { data: null, error: null };
      }

      let result = rows.filter((row) => filters.every((fn) => fn(row)));
      if (orderCol) {
        const col = orderCol;
        result = [...result].sort((a, b) => {
          const va = a[col];
          const vb = b[col];
          if (typeof va === "number" && typeof vb === "number") {
            return orderAsc ? va - vb : vb - va;
          }
          return orderAsc
            ? String(va ?? "").localeCompare(String(vb ?? ""))
            : String(vb ?? "").localeCompare(String(va ?? ""));
        });
      }

      if (singleMode) {
        return { data: result[0] ?? null, error: null };
      }
      return { data: result, error: null };
    };

    const builder = {
      select: (_columns?: string) => {
        if (op === "select") op = "select";
        return builder;
      },
      insert: (values: Record<string, unknown> | Record<string, unknown>[]) => {
        op = "insert";
        payloadData = values;
        return builder;
      },
      update: (values: Record<string, unknown>) => {
        op = "update";
        payloadData = values;
        return builder;
      },
      delete: () => {
        op = "delete";
        return builder;
      },
      eq: (column: string, value: unknown) => {
        filters.push((row) => row[column] === value);
        return builder;
      },
      order: (column: string, opts?: { ascending?: boolean }) => {
        orderCol = column;
        orderAsc = opts?.ascending ?? true;
        return builder;
      },
      abortSignal: (_signal?: AbortSignal) => builder,
      maybeSingle: () => {
        singleMode = true;
        return builder;
      },
      single: () => {
        singleMode = true;
        return builder;
      },
      then: <TResult1 = { data: unknown; error: null | { message: string } }, TResult2 = never>(
        onfulfilled?: ((value: { data: unknown; error: null | { message: string } }) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
      ) => execute().then(onfulfilled, onrejected),
    };

    return builder;
  };

  const client = {
    from: (table: TableName) => createQueryBuilder(table),
    rpc: async (fnName: string, args?: Record<string, unknown>) => {
      if (fnName === "get_public_questions") {
        const questions = getTableRows("questions") as unknown as Database["public"]["Tables"]["questions"]["Row"][];
        const publicQuestions = questions.map((q) => ({
          id: q.id,
          category: q.category,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          points: q.points,
          explanation: q.explanation ?? "",
        }));
        return { data: publicQuestions, error: null };
      }

      if (fnName === "admin_get_questions") {
        const questions = getTableRows("questions");
        return { data: questions, error: null };
      }

      if (fnName === "submit_quiz_answer") {
        const questionId = String(args?._question_id ?? "");
        const selectedAnswer = String(args?._selected_answer ?? "").toLowerCase();
        const questions = getTableRows("questions") as unknown as Database["public"]["Tables"]["questions"]["Row"][];
        const question = questions.find((q) => q.id === questionId);
        if (!question) {
          return { data: null, error: { message: "Question not found" } };
        }
        const isCorrect = question.correct_answer.toLowerCase() === selectedAnswer;
        const pointsEarned = isCorrect ? question.points : 0;

        const session = getCurrentSession();
        if (session?.user) {
          const attempts = getTableRows("quiz_attempts");
          attempts.push({
            id: makeId(),
            user_id: session.user.id,
            question_id: questionId,
            selected_answer: selectedAnswer,
            is_correct: isCorrect,
            points_earned: pointsEarned,
            created_at: new Date().toISOString(),
          });
          setTableRows("quiz_attempts", attempts);

          if (isCorrect) {
            const profiles = getTableRows("profiles");
            const idx = profiles.findIndex((p) => p.id === session.user.id);
            if (idx >= 0) {
              const currentPoints = Number(profiles[idx].total_points ?? 0);
              profiles[idx] = {
                ...profiles[idx],
                total_points: currentPoints + pointsEarned,
                updated_at: new Date().toISOString(),
              };
              setTableRows("profiles", profiles);
            }
          }
        }

        return {
          data: [
            {
              is_correct: isCorrect,
              points_earned: pointsEarned,
              correct_answer: question.correct_answer,
              explanation: question.explanation ?? "",
            },
          ],
          error: null,
        };
      }

      return { data: null, error: null };
    },
    auth: {
      getSession: async () => ({
        data: { session: getCurrentSession() },
        error: null,
      }),
      onAuthStateChange: (callback: AuthListener) => {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                listeners.delete(callback);
              },
            },
          },
        };
      },
      signUp: async ({
        email,
        password,
        options,
      }: {
        email: string;
        password: string;
        options?: { data?: { display_name?: string } };
      }) => {
        const accounts = readStore<StoredAccount[]>("accounts", []);
        const normalizedEmail = email.trim().toLowerCase();
        if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
          return { data: { user: null, session: null }, error: { message: "البريد الإلكتروني مسجّل بالفعل" } };
        }
        const displayName = options?.data?.display_name || normalizedEmail.split("@")[0] || "مستخدم";
        const newAccount: StoredAccount = {
          id: makeId(),
          email: normalizedEmail,
          password,
          display_name: displayName,
        };
        const isFirstUser = accounts.length === 0;
        accounts.push(newAccount);
        writeStore("accounts", accounts);

        const nowIso = new Date().toISOString();
        const profiles = getTableRows("profiles");
        profiles.push({
          id: newAccount.id,
          display_name: displayName,
          total_points: 0,
          created_at: nowIso,
          updated_at: nowIso,
        });
        setTableRows("profiles", profiles);

        const roles = getTableRows("user_roles");
        roles.push({
          id: makeId(),
          user_id: newAccount.id,
          role: "user",
          created_at: nowIso,
        });
        if (isFirstUser) {
          roles.push({
            id: makeId(),
            user_id: newAccount.id,
            role: "admin",
            created_at: nowIso,
          });
        }
        setTableRows("user_roles", roles);

        const session = buildSession(newAccount);
        writeStore("session", session);
        notifyAuth("SIGNED_IN", session);
        return { data: { user: session.user, session }, error: null };
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const accounts = readStore<StoredAccount[]>("accounts", []);
        const normalizedEmail = email.trim().toLowerCase();
        const account = accounts.find((a) => a.email.toLowerCase() === normalizedEmail && a.password === password);
        if (!account) {
          return {
            data: { user: null, session: null },
            error: { message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
          };
        }
        const session = buildSession(account);
        writeStore("session", session);
        notifyAuth("SIGNED_IN", session);
        return { data: { user: session.user, session }, error: null };
      },
      signOut: async () => {
        writeStore("session", null);
        notifyAuth("SIGNED_OUT", null);
        return { error: null };
      },
    },
  };

  return client as unknown as SupabaseClient<Database>;
}

const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const supabase: SupabaseClient<Database> = hasSupabaseEnv
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: {
        storage: brokeredPreviewStorage(),
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createLocalFallbackClient();