import { NextResponse } from "next/server";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import { hasSupabaseConfig, supabaseAdmin } from "@/lib/supabase-admin";
import type { SessionUser } from "@/lib/types";

export async function GET(request: Request) {
  if (!hasSupabaseConfig()) return NextResponse.json({ error: "Вход временно недоступен" }, { status: 503 });
  const nonce = new URL(request.url).searchParams.get("nonce");
  if (!nonce) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error } = await db.from("telegram_login_requests").select("*").eq("nonce", nonce).maybeSingle();
  if (error || !data) return NextResponse.json({ status: "expired" }, { status: 404 });
  if (new Date(data.expires_at).getTime() < Date.now()) return NextResponse.json({ status: "expired" });
  if (data.status !== "confirmed" || !data.telegram_id || !data.first_name) return NextResponse.json({ status: "pending" });

  const user: SessionUser = {
    telegramId: data.telegram_id,
    firstName: data.first_name,
    username: data.username ?? undefined,
    photoUrl: data.photo_url ?? undefined,
    phone: data.phone,
  };
  const { error: profileError } = await db.from("profiles").upsert(
    {
      telegram_id: user.telegramId,
      first_name: user.firstName,
      username: user.username ?? null,
      photo_url: user.photoUrl ?? null,
      phone: user.phone,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "telegram_id" },
  );
  if (profileError) return NextResponse.json({ error: "Не удалось сохранить профиль" }, { status: 500 });

  await db.from("telegram_login_requests").delete().eq("nonce", nonce);
  const response = NextResponse.json({ status: "confirmed", user });
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions);
  return response;
}
