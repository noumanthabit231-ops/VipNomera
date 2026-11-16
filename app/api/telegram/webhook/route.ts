import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat: { id: number };
    from?: { id: number; first_name: string; username?: string; photo_url?: string };
    contact?: { phone_number: string; user_id?: number };
  };
};

export async function POST(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const actual = request.headers.get("x-telegram-bot-api-secret-token");
  if (!expected || actual !== expected) return NextResponse.json({ ok: false }, { status: 401 });

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  if (!message || !message.from) return NextResponse.json({ ok: true });

  const siteUrl = new URL(request.url).origin;
  const match = message.text?.match(/^\/start\s+([0-9a-f-]{36})$/i);
  if (match) {
    const nonce = match[1];
    const db = supabaseAdmin();
    const { data } = await db.from("telegram_login_requests").select("expires_at,status").eq("nonce", nonce).maybeSingle();
    if (!data || data.status !== "pending" || new Date(data.expires_at).getTime() < Date.now()) {
      await sendTelegram(message.chat.id, "Ссылка устарела. Вернитесь на сайт и начните вход заново.", returnKeyboard(siteUrl));
      return NextResponse.json({ ok: true });
    }

    await db.from("telegram_login_requests").update({
      telegram_id: String(message.from.id),
      first_name: message.from.first_name,
      username: message.from.username ?? null,
      photo_url: message.from.photo_url ?? null,
    }).eq("nonce", nonce).eq("status", "pending");

    await sendTelegram(
      message.chat.id,
      "Подтвердите номер телефона. Telegram отправит боту только ваш номер, после чего мы сравним его с номером, введённым на сайте.",
      {
        keyboard: [[{ text: "Подтвердить номер", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
        input_field_placeholder: "Нажмите кнопку ниже",
      },
    );
    return NextResponse.json({ ok: true });
  }

  if (!message.contact) return NextResponse.json({ ok: true });
  if (message.contact.user_id !== message.from.id) {
    await sendTelegram(message.chat.id, "Нужно отправить именно свой номер через кнопку «Подтвердить номер».");
    return NextResponse.json({ ok: true });
  }

  const db = supabaseAdmin();
  const { data } = await db
    .from("telegram_login_requests")
    .select("nonce,phone,expires_at")
    .eq("telegram_id", String(message.from.id))
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) {
    await sendTelegram(message.chat.id, "Запрос входа не найден или устарел. Вернитесь на сайт и начните заново.", returnKeyboard(siteUrl));
    return NextResponse.json({ ok: true });
  }

  if (normalizeKzPhone(message.contact.phone_number) !== normalizeKzPhone(data.phone)) {
    await sendTelegram(
      message.chat.id,
      "Номер Telegram не совпадает с номером, введённым на сайте. Вернитесь на сайт и укажите свой номер.",
      returnKeyboard(siteUrl),
    );
    return NextResponse.json({ ok: true });
  }

  await db.from("telegram_login_requests").update({
    status: "confirmed",
    first_name: message.from.first_name,
    username: message.from.username ?? null,
    photo_url: message.from.photo_url ?? null,
  }).eq("nonce", data.nonce).eq("telegram_id", String(message.from.id));
  await sendTelegram(
    message.chat.id,
    "Готово! Номер подтверждён. Нажмите кнопку ниже — вход на сайте завершится автоматически.",
    returnKeyboard(siteUrl),
  );
  return NextResponse.json({ ok: true });
}

function normalizeKzPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `7${digits}`;
  if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;
  return digits;
}

function returnKeyboard(url: string) {
  return { inline_keyboard: [[{ text: "Вернуться на сайт", url }]] };
}

async function sendTelegram(chatId: number, text: string, replyMarkup?: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    }),
  });
}
