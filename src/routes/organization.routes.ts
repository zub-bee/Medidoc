import { Router } from "express";
import { validateRequest } from "../middlewares/validate-request";
import { validateObjectId } from "../middlewares/validate-id";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requireOrgAdmin } from "../middlewares/require-org-admin";
import { signupRateLimiter } from "../middlewares/rate-limiter";
import {
  CreateAdminSchema,
  CreatePractitionerSchema
} from "../validators/organization";
import {
  listAdmins,
  createAdmin,
  approveAdmin,
  listPractitioners,
  createPractitioner,
  approvePractitioner
} from "../controllers/organization.controller";

const router = Router();

router.get(
  "/organizations/:organizationId/admins",
  verifyAuthentication,
  requireOrgAdmin,
  listAdmins
);

router.post(
  "/organizations/:organizationId/admins",
  verifyAuthentication,
  requireOrgAdmin,
  validateRequest(CreateAdminSchema),
  signupRateLimiter,
  createAdmin
);

router.post(
  "/admins/:adminId/approve",
  verifyAuthentication,
  requireOrgAdmin,
  validateObjectId("adminId"),
  approveAdmin
);

router.get(
  "/organizations/:organizationId/practitioners",
  verifyAuthentication,
  requireOrgAdmin,
  listPractitioners
);

router.post(
  "/organizations/:organizationId/practitioners",
  verifyAuthentication,
  requireOrgAdmin,
  validateRequest(CreatePractitionerSchema),
  signupRateLimiter,
  createPractitioner
);

router.post(
  "/practitioners/:practitionerId/approve",
  verifyAuthentication,
  requireOrgAdmin,
  validateObjectId("practitionerId"),
  approvePractitioner
);

export default router;
