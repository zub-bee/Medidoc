import { Request } from "express";
import { OTP_TYPES } from "../constants/auth";

export type OTPType = (typeof OTP_TYPES)[number];

// export interface AvatarData {
//   public_id: string;
//   url: string;
//   size: number;
// }

// export interface PatientRequest extends Request {
//   patient?: {
//     _id?: string | undefined;
//     id?: string | undefined;
//     sessionId?: string | undefined;
//   };
// }

export interface IPatient {
  id: string;
  fullName: string;
  email: string;
  dob: Date;
  phone: string;
  gender: "male" | "female";
  address?: string;
  nin: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PatientRole = "patient";
