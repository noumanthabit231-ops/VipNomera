import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { hasSupabaseConfig, supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) return NextResponse.json({ error: "Вход временно недоступен" }, { status: 503 });
  const body = (await request.json()) as { phone?: string };
  const digits = String(body.phone ?? "").replace(/\D/g, "");
  if (digits.length !== 10) return NextResponse.json({ error: "Введите 10 цифр номера после +7" }, { status: 400 });

  const nonce = randomUUID();
  const { error } = await supabaseAdmin().from("telegram_login_requests").insert({
    nonce,
    phone: `+7${digits}`,
  });
  if (error) {
    console.error("Telegram login request failed", error);
    return NextResponse.json({ error: "Не удалось начать вход" }, { status: 500 });
  }

  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (!bot) return NextResponse.json({ error: "Telegram-бот не настроен" }, { status: 503 });
  return NextResponse.json({ nonce, url: `https://t.me/${bot.replace(/^@/, "")}?start=${nonce}` });
}
