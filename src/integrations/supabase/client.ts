import { createClient, type SupabaseClient, type Session, type User } from "@supabase/supabase-js";
import type { Database } from "./types";
import { brokeredPreviewStorage } from "./previewAuthStorage";
import { DEFAULT_AZKAR, DEFAULT_DUAS, DEFAULT_QUESTIONS } from "@/data/islamicData";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

type TableName = keyof Database["public"]["Tables"];

export interface StoredAccount {
  id: string;
  email: string;
  passwordHash: string;
  password?: string; // Legacy field migrated on read
  display_name: string;
}

const STORAGE_PREFIX = "al_noor_local_db_";
const ADMIN_EMAILS = new Set(["faresgomaa773@gmail.com"]);

/**
 * Deterministic salted FNV-1a / DJB2 Dual-64bit digest so plaintext passwords
 * are never stored in localStorage.
 */
export function hashPasswordSync(password: string, emailSalt: string): string {
  const normalizedSalt = emailSalt.trim().toLowerCase();
  const input = `alnoor::v1::${normalizedSalt}::${password}`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return `h1:${hex1}${hex2}`;
}

function verifyPasswordSync(account: StoredAccount, candidatePassword: string): boolean {
  const expectedHash = hashPasswordSync(candidatePassword, account.email);
  if (account.passwordHash) {
    return account.passwordHash === expectedHash;
  }
  if (typeof account.password === "string") {
    return account.password === candidatePassword;
  }
  return false;
}

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

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}

/**
 * Clean up any legacy local roles where regular users were mistakenly assigned
 * 'admin' due to the old first-user check, and migrate any legacy plaintext
 * passwords to hashed storage.
 */
function sanitizeLocalRoles(): void {
  if (typeof window === "undefined") return;
  try {
    const accounts = readStore<StoredAccount[]>("accounts", []);
    let accountsMigrated = false;
    const sanitizedAccounts = accounts.map((acc) => {
      if (typeof acc.password === "string" || !acc.passwordHash) {
        accountsMigrated = true;
        const hash = acc.passwordHash || hashPasswordSync(acc.password ?? "", acc.email);
        return {
          id: acc.id,
          email: acc.email,
          passwordHash: hash,
          display_name: acc.display_name,
        };
      }
      return acc;
    });
    if (accountsMigrated) {
      writeStore("accounts", sanitizedAccounts);
    }

    const roles = readStore<Array<Record<string, unknown>>>("user_roles", []);
    if (roles.length === 0) return;

    const adminUserIds = new Set(
      sanitizedAccounts
        .filter((a) => ADMIN_EMAILS.has(a.email.trim().toLowerCase()))
        .map((a) => a.id)
    );

    const cleaned = roles.filter((r) => {
      if (r.role === "admin") {
        return adminUserIds.has(String(r.user_id ?? ""));
      }
      return true;
    });

    if (cleaned.length !== roles.length) {
      writeStore("user_roles", cleaned);
    }
  } catch {
    // Ignore storage errors
  }
}

sanitizeLocalRoles();

function isCurrentLocalUserAdmin(): boolean {
  const session = readStore<Session | null>("session", null);
  const user = session?.user;
  if (!user) return false;
  if (user.email && ADMIN_EMAILS.has(user.email.trim().toLowerCase())) {
    return true;
  }
  const roles = readStore<Array<Record<string, unknown>>>("user_roles", []);
  return roles.some((r) => r.user_id === user.id && r.role === "admin");
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
      sanitizeLocalRoles();
      return readStore("user_roles", []);
    default:
      return [];
  }
}

function setTableRows(table: TableName, rows: Record<string, unknown>[]): void {
  writeStore(table, rows);
}

function ensureLocalProfileAndRole(account: StoredAccount): void {
  const nowIso = new Date().toISOString();
  const profiles = getTableRows("profiles");
  if (!profiles.some((p) => p.id === account.id)) {
    profiles.push({
      id: account.id,
      display_name: account.display_name,
      total_points: 0,
      created_at: nowIso,
      updated_at: nowIso,
    });
    setTableRows("profiles", profiles);
  }

  const roles = readStore<Array<Record<string, unknown>>>("user_roles", []);
  if (!roles.some((r) => r.user_id === account.id && r.role === "user")) {
    roles.push({
      id: makeId(),
      user_id: account.id,
      role: "user",
      created_at: nowIso,
    });
  }

  // Only explicitly whitelisted owner email gets admin role; regular users are always 'user'
  if (
    ADMIN_EMAILS.has(account.email.trim().toLowerCase()) &&
    !roles.some((r) => r.user_id === account.id && r.role === "admin")
  ) {
    roles.push({
      id: makeId(),
      user_id: account.id,
      role: "admin",
      created_at: nowIso,
    });
  }

  setTableRows("user_roles", roles);
}

function buildLocalSession(account: StoredAccount): Session {
  const nowSec = Math.floor(Date.now() / 1000);
  const user: User = {
    id: account.id,
    app_metadata: { role: "user" },
    user_metadata: { display_name: account.display_name, role: "user" },
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
}

const ADMIN_PROTECTED_TABLES = new Set<TableName>(["azkar", "duas", "questions", "user_roles"]);

function createLocalQueryBuilder(table: TableName) {
  let op: "select" | "insert" | "update" | "delete" = "select";
  let payloadData: Record<string, unknown> | Record<string, unknown>[] | null = null;
  const filters: Array<(row: Record<string, unknown>) => boolean> = [];
  let orderCol: string | null = null;
  let orderAsc = true;
  let singleMode = false;

  const execute = async (): Promise<{ data: unknown; error: null | { message: string } }> => {
    if (op !== "select" && ADMIN_PROTECTED_TABLES.has(table) && !isCurrentLocalUserAdmin()) {
      return { data: null, error: { message: "غير مصرح لك بتنفيذ هذه العملية (للمدراء فقط)." } };
    }

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
}

function createHybridClient(rawRemoteClient: SupabaseClient<Database> | null): SupabaseClient<Database> {
  type AuthListener = (event: string, session: Session | null) => void;
  const listeners = new Set<AuthListener>();

  const getLocalSession = (): Session | null => {
    return readStore<Session | null>("session", null);
  };

  const isUsingLocalSession = (): boolean => {
    const s = getLocalSession();
    return Boolean(s?.access_token?.startsWith("local-token-"));
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

  if (rawRemoteClient) {
    rawRemoteClient.auth.onAuthStateChange((event, remoteSession) => {
      if (remoteSession) {
        writeStore("session", null);
        notifyAuth(event, remoteSession);
      } else if (!isUsingLocalSession()) {
        notifyAuth(event, null);
      }
    });
  }

  const upsertLocalAccount = (
    email: string,
    password: string,
    displayName: string,
    id?: string
  ): StoredAccount => {
    const accounts = readStore<StoredAccount[]>("accounts", []);
    const normalizedEmail = email.trim().toLowerCase();
    const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === normalizedEmail);
    const nextHash = password
      ? hashPasswordSync(password, normalizedEmail)
      : existingIdx >= 0
        ? accounts[existingIdx].passwordHash
        : hashPasswordSync("", normalizedEmail);

    const account: StoredAccount =
      existingIdx >= 0
        ? {
            id: accounts[existingIdx].id,
            email: normalizedEmail,
            passwordHash: nextHash,
            display_name: displayName || accounts[existingIdx].display_name,
          }
        : {
            id: id || makeId(),
            email: normalizedEmail,
            passwordHash: nextHash,
            display_name: displayName,
          };

    if (existingIdx >= 0) {
      accounts[existingIdx] = account;
    } else {
      accounts.push(account);
    }
    writeStore("accounts", accounts);
    ensureLocalProfileAndRole(account);
    return account;
  };

  const executeLocalRpc = async (fnName: string, args?: Record<string, unknown>) => {
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
      if (!isCurrentLocalUserAdmin()) {
        return { data: null, error: { message: "غير مصرح بالوصول إلى بيانات الإدارة." } };
      }
      const questions = getTableRows("questions");
      return { data: questions, error: null };
    }

    if (fnName === "submit_quiz_answer") {
      const questionId = String(args?._question_id ?? "");
      const selectedAnswer = String(args?._selected_answer ?? "").toLowerCase();
      if (!["a", "b", "c", "d"].includes(selectedAnswer)) {
        return { data: null, error: { message: "خيار غير صالح." } };
      }
      const questions = getTableRows("questions") as unknown as Database["public"]["Tables"]["questions"]["Row"][];
      const question = questions.find((q) => q.id === questionId);
      if (!question) {
        return { data: null, error: { message: "Question not found" } };
      }
      const isCorrect = question.correct_answer.toLowerCase() === selectedAnswer;
      const pointsEarned = isCorrect ? question.points : 0;

      const session = getLocalSession();
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
  };

  const client = {
    from: (table: TableName) => {
      if (!rawRemoteClient || isUsingLocalSession()) {
        return createLocalQueryBuilder(table);
      }
      return rawRemoteClient.from(table);
    },
    rpc: async (fnName: keyof Database["public"]["Functions"], args?: Record<string, unknown>) => {
      if (!rawRemoteClient || isUsingLocalSession()) {
        return executeLocalRpc(fnName, args);
      }
      const res = await rawRemoteClient.rpc(fnName, args as never);
      if (res.error) {
        return executeLocalRpc(fnName, args);
      }
      return res;
    },
    auth: {
      getSession: async () => {
        const localSession = getLocalSession();
        if (localSession) {
          return { data: { session: localSession }, error: null };
        }
        if (rawRemoteClient) {
          const remote = await rawRemoteClient.auth.getSession();
          if (remote.data?.session) {
            return remote;
          }
        }
        return { data: { session: null }, error: null };
      },
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
        options?: { emailRedirectTo?: string; data?: { display_name?: string } };
      }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const displayName =
          options?.data?.display_name?.trim() || normalizedEmail.split("@")[0] || "مستخدم";

        const existingAccounts = readStore<StoredAccount[]>("accounts", []);
        if (existingAccounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
          return {
            data: { user: null, session: null },
            error: { message: "هذا البريد الإلكتروني مسجّل بالفعل." },
          };
        }

        if (rawRemoteClient) {
          try {
            const remoteRes = await rawRemoteClient.auth.signUp({
              email: normalizedEmail,
              password,
              options: {
                ...options,
                data: {
                  ...options?.data,
                  display_name: displayName,
                },
              },
            });

            if (!remoteRes.error && remoteRes.data.session && remoteRes.data.user) {
              upsertLocalAccount(normalizedEmail, password, displayName, remoteRes.data.user.id);
              writeStore("session", null);
              notifyAuth("SIGNED_IN", remoteRes.data.session);
              return remoteRes;
            }

            if (remoteRes.error) {
              const lowerMsg = remoteRes.error.message.toLowerCase();
              if (lowerMsg.includes("already registered") || lowerMsg.includes("already exists")) {
                return remoteRes;
              }
            }

            // If remote signup succeeded with session=null (email confirmation pending)
            // or hit rate-limit/password policy in preview, create an active local user session
            // with 'user' role so the user can log in immediately as a regular user.
            const remoteUserId = remoteRes.data?.user?.id;
            const localAccount = upsertLocalAccount(
              normalizedEmail,
              password,
              displayName,
              remoteUserId
            );
            const session = buildLocalSession(localAccount);
            writeStore("session", session);
            notifyAuth("SIGNED_IN", session);
            return { data: { user: session.user, session }, error: null };
          } catch {
            // Fall through to local account creation on network failure
          }
        }

        const localAccount = upsertLocalAccount(normalizedEmail, password, displayName);
        const session = buildLocalSession(localAccount);
        writeStore("session", session);
        notifyAuth("SIGNED_IN", session);
        return { data: { user: session.user, session }, error: null };
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const accounts = readStore<StoredAccount[]>("accounts", []);
        const localAccount = accounts.find(
          (a) => a.email.toLowerCase() === normalizedEmail && verifyPasswordSync(a, password)
        );

        if (rawRemoteClient) {
          try {
            const remoteRes = await rawRemoteClient.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });
            if (!remoteRes.error && remoteRes.data.session) {
              const displayName =
                (remoteRes.data.user?.user_metadata?.display_name as string | undefined) ||
                localAccount?.display_name ||
                normalizedEmail.split("@")[0] ||
                "مستخدم";
              upsertLocalAccount(
                normalizedEmail,
                password,
                displayName,
                remoteRes.data.user?.id
              );
              writeStore("session", null);
              notifyAuth("SIGNED_IN", remoteRes.data.session);
              return remoteRes;
            }

            // If remote fails due to unconfirmed email or local-only account, use verified local account
            if (localAccount) {
              ensureLocalProfileAndRole(localAccount);
              const session = buildLocalSession(localAccount);
              writeStore("session", session);
              notifyAuth("SIGNED_IN", session);
              return { data: { user: session.user, session }, error: null };
            }

            return remoteRes;
          } catch {
            // Fall back to local account check on network failure
          }
        }

        if (!localAccount) {
          return {
            data: { user: null, session: null },
            error: { message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
          };
        }

        ensureLocalProfileAndRole(localAccount);
        const session = buildLocalSession(localAccount);
        writeStore("session", session);
        notifyAuth("SIGNED_IN", session);
        return { data: { user: session.user, session }, error: null };
      },
      signOut: async () => {
        writeStore("session", null);
        if (rawRemoteClient) {
          try {
            await rawRemoteClient.auth.signOut();
          } catch {
            // Ignore remote signOut errors
          }
        }
        notifyAuth("SIGNED_OUT", null);
        return { error: null };
      },
    },
  };

  return client as unknown as SupabaseClient<Database>;
}

const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

const rawRemoteSupabase: SupabaseClient<Database> | null = hasSupabaseEnv
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: {
        storage: brokeredPreviewStorage(),
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const supabase: SupabaseClient<Database> = createHybridClient(rawRemoteSupabase);