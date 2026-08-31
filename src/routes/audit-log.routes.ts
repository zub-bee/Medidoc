import { Router } from "express";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requirePlatform } from "../middlewares/require-platform";
import { listAuditLogs } from "../controllers/audit-log.controller";

const router = Router();

router.get("/audit-logs", verifyAuthentication, requirePlatform, listAuditLogs);

export default router;
