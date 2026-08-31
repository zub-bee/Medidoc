import { and, desc, eq } from "drizzle-orm";
import db from "../configs/db";
import { audit_logs } from "../drizzle/schemas/audit-logs.schema";

export type AuditLogFilters = {
  actorId?: string;
  targetTable?: string;
  targetId?: string;
  limit?: number;
};

export class AuditLogService {
  static async list({
    actorId,
    targetTable,
    targetId,
    limit
  }: AuditLogFilters) {
    const conditions = [];

    if (actorId) {
      conditions.push(eq(audit_logs.actorId, actorId));
    }
    if (targetTable) {
      conditions.push(eq(audit_logs.targetTable, targetTable));
    }
    if (targetId) {
      conditions.push(eq(audit_logs.targetId, targetId));
    }

    const boundedLimit = Math.min(Math.max(limit || 50, 1), 200);

    return db
      .select()
      .from(audit_logs)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(audit_logs.createdAt))
      .limit(boundedLimit);
  }
}
