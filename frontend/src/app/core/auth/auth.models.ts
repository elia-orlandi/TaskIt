export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type LoginRequest = {
  email: string;
  password: string;
}

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export type AuthResponse = {
  message: string;
  user: User;
  token: string;
}

export type ForgotPasswordRequest = {
  email: string;
}

export type ResetPasswordRequest = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export type MessageResponse = {
  message: string;
}
