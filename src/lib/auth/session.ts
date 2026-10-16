let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import { cookies } from "next/headers";
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

function getSessionSecret(): string {
  const secret = (vault.read('SESSION_SECRET') ?? process.env.SESSION_SECRET) || (vault.read('CRON_SECRET') ?? process.env.CRON_SECRET);
  if (!secret) {
    if ((vault.read('NODE_ENV') ?? process.env.NODE_ENV) === "production") {
      throw new Error("CRITICAL SECURITY ERROR: SESSION_SECRET or CRON_SECRET is mandatory in production!");
    }
    return "alparai-sovereign-session-secret-key-2026";
  }
  return secret;
}

const COOKIE_NAME = "alparai_session";

async function sign(payload: string): Promise<string> {
  const secret = getSessionSecret();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const base64 = Buffer.from(signature).toString('base64');
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${payload}.${base64url}`;
}

async function verify(token: string): Promise<AlparUser | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const payload = parts[0];
    const sig = parts[1];
    if (!payload || !sig) return null;
    const secret = getSessionSecret();
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    
    // pad base64url back to base64 for Buffer
    let base64 = sig.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const signature = Buffer.from(base64, 'base64');
    
    const isValid = await crypto.subtle.verify("HMAC", key, signature, enc.encode(payload));
    if (!isValid) return null;
    const jsonStr = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(jsonStr) as AlparUser;
  } catch (e) {
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
  const token = await sign(payload);
  const cookieStore = await cookies();
  const isProduction = (vault.read('NODE_ENV') ?? process.env.NODE_ENV) === "production";

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
    const user = await verify(c.value);
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

export async function createSessionCookieHeader(user: Omit<AlparUser, "created_at">): Promise<{
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    path: string;
    maxAge: number;
  };
}> {
  const role = resolveRole(user.email, user.role);
  const fullUser: AlparUser = {
    ...user,
    role,
    created_at: new Date().toISOString(),
  };
  const payload = Buffer.from(JSON.stringify(fullUser)).toString("base64url");
  const token = await sign(payload);
  const isProduction = (vault.read('NODE_ENV') ?? process.env.NODE_ENV) === "production";

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
