export type UserRole = 'ADMIN' | 'USER';
export type SubStatus = 'INACTIVE' | 'PENDING' | 'ACTIVE';

export interface Label {
  id: string;
  text: string;
  color: string;
  created_at?: string;
}

export interface Phone {
  id: string;
  number: string;
  price: number;
  status: 'IN_STOCK' | 'ON_ORDER' | 'SOLD';
  label_ids: string[];
  created_at?: string;
  sold_at?: string | null;
}

export interface UserProfile {
  phone: string;
  full_name?: string;
  role: UserRole;
  subscription: SubStatus;
  expiry_date?: string | null;
  tg_user_id?: number;
}

export interface Order {
  id: string;
  user_phone: string;
  phone_number: string;
  price: number;
  type: 'PURCHASE' | 'ORDER';
  status?: string;
  created_at: string;
}
