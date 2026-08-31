import { Response } from "express";
import { AsyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { UserRequest } from "../types/user";
import { AuditLogService } from "../services/audit-log.service";

export const listAuditLogs = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { actorId, targetTable, targetId, limit } = req.query;

    const auditLogs = await AuditLogService.list({
      actorId: typeof actorId === "string" ? actorId : undefined,
      targetTable: typeof targetTable === "string" ? targetTable : undefined,
      targetId: typeof targetId === "string" ? targetId : undefined,
      limit: typeof limit === "string" ? Number(limit) : undefined
    });

    return ApiResponse.ok(res, "Audit logs fetched successfully", auditLogs);
  }
);
