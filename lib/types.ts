export type Operator = "Beeline" | "Tele2" | "ALTEL" | "activ" | "Kcell";

export type Listing = {
  id: string;
  phone: string;
  title: string;
  operator: Operator;
  price: number;
  category: "Обычные" | "Красивые" | "Бизнес";
  promoted?: boolean;
  source?: "site" | "user";
  created_at?: string;
};

export type SessionUser = {
  telegramId: string;
  firstName: string;
  username?: string;
  photoUrl?: string;
  phone?: string;
};

export type TelegramUserPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};
