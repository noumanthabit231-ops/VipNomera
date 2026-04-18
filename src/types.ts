export type UserRole = 'ADMIN' | 'USER';
export type SubStatus = 'INACTIVE' | 'PENDING' | 'ACTIVE';

export interface Label {
  id: string;
  text: string;
  color: string;
}

export interface Phone {
  id: string;
  number: string;
  price: number;
  status: 'IN_STOCK' | 'ON_ORDER';
  labelIds: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  subscription: SubStatus;
}
