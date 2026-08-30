import { NextFunction, Response } from "express";
import { eq } from "drizzle-orm";
import db from "../configs/db";
import { practitioners } from "../drizzle/schemas/practitioners.schema";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";

export async function requirePractitioner(
  req: UserRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?._id || req.user.role !== "practitioner") {
      return next(ApiError.forbidden("Practitioner access required"));
    }

    const [practitionerRecord] = await db
      .select()
      .from(practitioners)
      .where(eq(practitioners.userId, req.user._id))
      .limit(1);

    if (!practitionerRecord) {
      return next(ApiError.forbidden("Practitioner account does not exist"));
    }

    if (practitionerRecord.status !== "active") {
      return next(
        ApiError.forbidden("Practitioner account is not yet approved")
      );
    }

    req.practitioner = practitionerRecord;

    return next();
  } catch (err) {
    return next(ApiError.server("Something went wrong"));
  }
}
