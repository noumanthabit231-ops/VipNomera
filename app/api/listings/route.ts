import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { demoListings } from "@/lib/demo-data";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";
import { hasSupabaseConfig, supabaseAdmin } from "@/lib/supabase-admin";
import type { Operator } from "@/lib/types";

const operators: Operator[] = ["Beeline", "Tele2", "ALTEL", "activ", "Kcell"];

export async function GET() {
  if (!hasSupabaseConfig()) return NextResponse.json({ listings: demoListings, demo: true });
  const { data, error } = await supabaseAdmin()
    .from("listings")
    .select("id,phone,title,operator,price,category,promoted,created_at,owner_telegram_id")
    .eq("status", "published")
    .order("promoted", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Listings load failed", error);
    return NextResponse.json({ listings: demoListings, demo: true });
  }
  return NextResponse.json({
    listings: data.map(({ owner_telegram_id, ...listing }) => ({
      ...listing,
      source: owner_telegram_id === "demo" ? "site" : "user",
    })),
  });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const user = readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "Сначала войдите через Telegram" }, { status: 401 });
  if (!hasSupabaseConfig()) return NextResponse.json({ error: "База данных ещё не подключена" }, { status: 503 });

  const body = (await request.json()) as Record<string, unknown>;
  const digits = String(body.phone ?? "").replace(/\D/g, "");
  const operator = String(body.operator ?? "") as Operator;
  const price = Number(body.price);
  const title = String(body.title ?? "").trim().slice(0, 80);
  const category = String(body.category ?? "Обычные");
  if (digits.length !== 10 || !operators.includes(operator) || !Number.isFinite(price) || price < 1000 || !title) {
    return NextResponse.json({ error: "Проверьте номер, цену и описание" }, { status: 400 });
  }

  const formattedPhone = `+7 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  const { data, error } = await supabaseAdmin()
    .from("listings")
    .insert({
      owner_telegram_id: user.telegramId,
      phone: formattedPhone,
      contact_phone: user.phone ?? `+7${digits}`,
      operator,
      price: Math.round(price),
      title,
      category,
      status: "published",
    })
    .select("id,phone,title,operator,price,category,promoted,created_at")
    .single();

  if (error) {
    console.error("Listing create failed", error);
    return NextResponse.json({ error: "Не удалось сохранить объявление" }, { status: 500 });
  }
  return NextResponse.json({ listing: { ...data, source: "user" } }, { status: 201 });
}
