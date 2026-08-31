import { NextFunction, Response } from "express";
import { eq } from "drizzle-orm";
import db from "../configs/db";
import { admins } from "../drizzle/schemas/admins.schema";
import { providers } from "../drizzle/schemas/providers.schema";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";

export async function requireOrgAdmin(
  req: UserRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?._id) {
      return next(ApiError.forbidden("Admin access required"));
    }

    if (req.user.role === "admin") {
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
    }

    if (req.user.role === "provider") {
      const [provider] = await db
        .select()
        .from(providers)
        .where(eq(providers.userId, req.user._id))
        .limit(1);

      if (!provider || provider.status !== "verified") {
        return next(
          ApiError.forbidden("Provider organization access required")
        );
      }

      const { organizationId } = req.params;
      if (organizationId && organizationId !== provider.id) {
        return next(
          ApiError.forbidden("You do not have access to this organization")
        );
      }

      const [adminRecord] = await db
        .select()
        .from(admins)
        .where(eq(admins.userId, req.user._id))
        .limit(1);

      if (!adminRecord) {
        return next(ApiError.forbidden("Admin access required"));
      }

      req.admin = { id: adminRecord.id, organizationId: provider.id };

      return next();
    }

    return next(ApiError.forbidden("Admin access required"));
  } catch (err) {
    return next(ApiError.server("Something went wrong"));
  }
}
