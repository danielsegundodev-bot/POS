export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  accessToken: string;
  user: User;
  /** ISO8601 de expiración del token. */
  expiresAt: string;
}
