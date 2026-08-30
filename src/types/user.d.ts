import { Request } from "express";
import { OTP_TYPES } from "../constants/auth";

export type OTPType = (typeof OTP_TYPES)[number];

export interface AvatarData {
  public_id: string;
  url: string;
  size: number;
}

export interface UserRequest extends Request {
  user?: {
    _id?: string | undefined;
    id?: string | undefined;
    role?: UserRole;
    sessionId?: string | undefined;
  };
  admin?: {
    id: string;
    organizationId: string;
  };
  patient_id?: string;
  practitioner?: {
    id: string;
    organizationId: string;
  };
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  avatar?: AvatarData | string | null;
  provider: "local" | "google" | "github";
  providerId?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  reActivateAvailableAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole =
  "patient" | "admin" | "provider" | "practitioner" | "platform";

export type RefreshTokenData = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type SessionData = {
  userId: string;
  sessionId: string;
  refreshTokenHash: string;
  userAgent: string;
  ip: string;
  createdAt: Date;
  expiresAt: Date;
};
