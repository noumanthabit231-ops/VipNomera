import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { SessionUser, TelegramUserPayload } from "./types";

export const SESSION_COOKIE = "nomeraplus_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 90;

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured");
  return value;
}

export function createSessionToken(user: SessionUser) {
  const payload = base64url(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_AGE_SECONDS }));
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readSessionToken(token?: string | null): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser & { exp: number };
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return null;
    const { exp: _exp, ...user } = decoded;
    return user;
  } catch {
    return null;
  }
}

export function verifyTelegramPayload(payload: TelegramUserPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  if (Math.abs(Date.now() / 1000 - payload.auth_date) > 86400) return false;

  const { hash, ...fields } = payload;
  const dataCheckString = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const key = createHash("sha256").update(token).digest();
  const expected = createHmac("sha256", key).update(dataCheckString).digest("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_AGE_SECONDS,
};
