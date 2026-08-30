import { NextFunction, Response } from "express";
import { eq } from "drizzle-orm";
import db from "../configs/db";
import { admins } from "../drizzle/schemas/admins.schema";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";

export async function requireOrgAdmin(
  req: UserRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (
      !req.user?._id ||
      (req.user.role !== "admin" && req.user.role !== "provider")
    ) {
      return next(ApiError.forbidden("Admin access required"));
    }

    const [adminRecord] = await db
      .select()
      .from(admins)
      .where(eq(admins.userId, req.user._id))
      .limit(1);

    if (!adminRecord || adminRecord.status !== "verified") {
      return next(ApiError.forbidden("Admin access required"));
    }

    const { organizationId } = req.params;
    if (organizationId && organizationId !== adminRecord.organizationId) {
      return next(
        ApiError.forbidden("You do not have access to this organization")
      );
    }

    req.admin = {
      id: adminRecord.id,
      organizationId: adminRecord.organizationId
    };

    return next();
  } catch (err) {
    return next(ApiError.server("Something went wrong"));
  }
}
