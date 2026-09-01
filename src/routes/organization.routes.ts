import { Router } from "express";
import { validateRequest } from "../middlewares/validate-request";
import { validateObjectId } from "../middlewares/validate-id";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requireOrgAdmin } from "../middlewares/require-org-admin";
import {
  requireOrgStaff,
  requireOrgMember
} from "../middlewares/require-org-staff";
import { requirePlatform } from "../middlewares/require-platform";
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
  approvePractitioner,
  listOrganizations,
  listPublicOrganizations,
  verifyOrganization,
  suspendOrganization,
  reinstateOrganization,
  getPlatformStats,
  listOrganizationPatients,
  listPublicPractitioners
} from "../controllers/organization.controller";
import {
  listOrganizationAppointments,
  getPractitionerAvailability
} from "../controllers/appointment.controller";
import { listOrganizationInvoices } from "../controllers/invoice.controller";

const router = Router();

//? PLATFORM-SCOPED

router.get(
  "/organizations",
  verifyAuthentication,
  requirePlatform,
  listOrganizations
);

router.get(
  "/organizations/public",
  verifyAuthentication,
  listPublicOrganizations
);

router.get(
  "/platform/stats",
  verifyAuthentication,
  requirePlatform,
  getPlatformStats
);

router.post(
  "/organizations/:organizationId/verify",
  verifyAuthentication,
  requirePlatform,
  validateObjectId("organizationId"),
  verifyOrganization
);

router.post(
  "/organizations/:organizationId/suspend",
  verifyAuthentication,
  requirePlatform,
  validateObjectId("organizationId"),
  suspendOrganization
);

router.post(
  "/organizations/:organizationId/reinstate",
  verifyAuthentication,
  requirePlatform,
  validateObjectId("organizationId"),
  reinstateOrganization
);

//? ORG-SCOPED DIRECTORIES

router.get(
  "/organizations/:organizationId/patients",
  verifyAuthentication,
  requireOrgStaff,
  listOrganizationPatients
);

router.get(
  "/organizations/:organizationId/appointments",
  verifyAuthentication,
  requireOrgStaff,
  listOrganizationAppointments
);

router.get(
  "/organizations/:organizationId/invoices",
  verifyAuthentication,
  requireOrgStaff,
  listOrganizationInvoices
);

router.get(
  "/organizations/:organizationId/practitioners/public",
  verifyAuthentication,
  requireOrgMember,
  listPublicPractitioners
);

router.get(
  "/organizations/:organizationId/practitioners/:practitionerId/availability",
  verifyAuthentication,
  requireOrgMember,
  validateObjectId("practitionerId"),
  getPractitionerAvailability
);

//? ADMIN-ONLY STAFF MANAGEMENT

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
