import { cookies } from "next/headers";
import { createHmac } from "crypto";
import type { SessionUser, UserRole } from "@/types";
import { isTestAuthBypassActive, getPlaywrightMockUser } from "./test-bypass";

export interface AlparUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: UserRole;
  created_at: string;
}

const SECRET = process.env.CRON_SECRET || "alparai-sovereign-session-secret-key-2026";
const COOKIE_NAME = "alparai_session";

function sign(payload: string): string {
  const hmac = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

function verify(token: string): AlparUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const payload = parts[0];
    const sig = parts[1];
    if (!payload || !sig) return null;
    const expectedSig = createHmac("sha256", SECRET).update(payload).digest("base64url");
    if (sig !== expectedSig) return null;
    const jsonStr = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(jsonStr) as AlparUser;
  } catch {
    return null;
  }
}

function resolveRole(email: string | null | undefined, currentRole: UserRole): UserRole {
  if (!email) return currentRole;
  const em = email.toLowerCase();
  if (
    em === "quantum.matrix.core@gmail.com" ||
    em === "ercumenterden@gmail.com" ||
    em === "ercument.erden@alparai.com" ||
    em.endsWith("@alparai.com")
  ) {
    return "ceo";
  }
  return currentRole;
}

export async function setSessionUser(user: Omit<AlparUser, "created_at">): Promise<void> {
  const role = resolveRole(user.email, user.role);
  const fullUser: AlparUser = {
    ...user,
    role,
    created_at: new Date().toISOString(),
  };
  const payload = Buffer.from(JSON.stringify(fullUser)).toString("base64url");
  const token = sign(payload);
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getSessionUser(): Promise<AlparUser | null> {
  try {
    const cookieStore = await cookies();
    const c = cookieStore.get(COOKIE_NAME);
    if (!c || !c.value) return null;
    const user = verify(c.value);
    if (!user) return null;
    user.role = resolveRole(user.email, user.role);
    return user;
  } catch {
    return null;
  }
}

export async function clearSessionUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function createSessionCookieHeader(user: Omit<AlparUser, "created_at">): {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    path: string;
    maxAge: number;
  };
} {
  const role = resolveRole(user.email, user.role);
  const fullUser: AlparUser = {
    ...user,
    role,
    created_at: new Date().toISOString(),
  };
  const payload = Buffer.from(JSON.stringify(fullUser)).toString("base64url");
  const token = sign(payload);
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    },
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (isTestAuthBypassActive()) {
    return getPlaywrightMockUser();
  }
  const u = await getSessionUser();
  if (!u) return null;
  const role = resolveRole(u.email, u.role);
  return {
    id: u.id,
    email: u.email,
    fullName: u.name,
    avatarUrl: u.picture,
    role,
    isVerified: true,
    createdAt: u.created_at,
  };
}

export async function isModerator(): Promise<boolean> {
  const user = await getCurrentUser();
  const r = user?.role as string | undefined;
  return r === "moderator" || r === "admin" || r === "ceo";
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  const r = user?.role as string | undefined;
  return r === "admin" || r === "ceo";
}

export async function isCEO(): Promise<boolean> {
  const user = await getCurrentUser();
  const r = user?.role as string | undefined;
  return r === "ceo" || r === "admin";
}

export async function isAdvisor(): Promise<boolean> {
  const user = await getCurrentUser();
  const r = user?.role as string | undefined;
  return r === "advisor" || r === "ceo" || r === "admin";
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireModerator(): Promise<SessionUser> {
  const user = await requireUser();
  const r = user.role as string;
  if (r !== "moderator" && r !== "admin" && r !== "ceo") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  const r = user.role as string;
  if (r !== "admin" && r !== "ceo") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireCEO(): Promise<SessionUser> {
  const user = await requireUser();
  const r = user.role as string;
  if (r !== "ceo" && r !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireAdvisor(): Promise<SessionUser> {
  const user = await requireUser();
  const r = user.role as string;
  if (r !== "advisor" && r !== "ceo" && r !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

