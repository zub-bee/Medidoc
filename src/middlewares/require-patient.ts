import { NextFunction, Response } from "express";
import { eq } from "drizzle-orm";
import db from "../configs/db";
import { users } from "../drizzle/schemas/user.schema";
import { patients } from "../drizzle/schemas/patients.schema";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";

export async function requirePatientUser(
  req: UserRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?._id || req.user.role !== "patient") {
      return next(ApiError.forbidden("Patient access required"));
    }

    const [userAccount] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user._id))
      .limit(1);

    if (!userAccount) {
      return next(ApiError.unauthorized("Unauthorized, please login."));
    }

    const [patientAccount] = await db
      .select()
      .from(patients)
      .where(eq(patients.email, userAccount.email))
      .limit(1);

    if (!patientAccount || userAccount.isDeleted) {
      // verified nin could be a requirement or not, isPhoneVerified could be added to patient table or user table
      return next(ApiError.forbidden("Patient account does not exist"));
    }

    req.patient = patientAccount;

    return next();
  } catch (err) {
    return next(ApiError.server("Something went wrong"));
  }
}
