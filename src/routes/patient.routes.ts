import { Router } from "express";
import { validateRequest } from "../middlewares/validate-request";
import { validateObjectId } from "../middlewares/validate-id";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requirePatientUser } from "../middlewares/require-patient";
import { requirePatientAccess } from "../middlewares/require-patient-access";
import upload from "../middlewares/upload-file";
import { checkUserAccountRestriction } from "../middlewares/user-account-restriction";
import {
  handlePatientProfile,
  getPatientSummaries,
  updatePatientProfile,
  getOrganizationAccess,
  assignOrganizationAccess,
  revokeOrganizationAccess,
  revokePractitionerAccess,
  assignPractitionerAccess,
  getEpisodes,
  createEpisode,
  createSummary,
  getClinicalEntries,
  createClinicalEntry,
  getPractiitonerAccess
} from "../controllers/patient.controller";
import {
  listAppointments,
  createAppointment,
  checkInAppointment
} from "../controllers/appointment.controller";
import {
  listInvoices,
  createInvoice,
  markInvoicePaid
} from "../controllers/invoice.controller";
import { listPayments, createPayment } from "../controllers/payment.controller";
import {
  listConsentForms,
  createConsentForm,
  signConsentForm
} from "../controllers/consent-form.controller";
import { CreateAppointmentSchema } from "../validators/appointment";
import { CreateInvoiceSchema } from "../validators/invoice";
import { CreatePaymentSchema } from "../validators/payment";
import { CreateConsentFormSchema } from "../validators/consent-form";
import {
  UpdatePatientProfileSchema,
  OrganizationAccessSchema,
  PractitionerAccessSchema,
  AccessIdParamsSchema,
  NewEpisodeLabelSchema,
  NewSummarySchema,
  NewClinicalEntrySchema
} from "@/validators/patient";
import { UpdateProfileSchema } from "@/validators/auth";

const router = Router();

router.get(
  "/me",
  verifyAuthentication,
  requirePatientUser,
  handlePatientProfile
);

router.get(
  "/:patientId",
  verifyAuthentication,
  requirePatientAccess(),
  handlePatientProfile
);

router.patch(
  "/:patientId",
  verifyAuthentication,
  requirePatientUser,
  checkUserAccountRestriction,
  validateRequest(UpdatePatientProfileSchema),
  updatePatientProfile
);

router.get(
  "/:patientId/organization-access",
  verifyAuthentication,
  requirePatientAccess(),
  getOrganizationAccess
);

router.post(
  "/:patientId/organization-access",
  verifyAuthentication,
  requirePatientUser,
  validateRequest(OrganizationAccessSchema),
  assignOrganizationAccess
);

router.post(
  "/:patientId/organization-access/:accessId/revoke",
  verifyAuthentication,
  requirePatientUser,
  validateRequest(AccessIdParamsSchema, "params"),
  revokeOrganizationAccess
);

router.get(
  "/:patientId/practitioner-access",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "patient", "provider"] }),
  getPractiitonerAccess
);

router.post(
  "/:patientId/practitioner-access",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin"] }),
  validateRequest(PractitionerAccessSchema),
  assignPractitionerAccess
);

router.post(
  "/:patientId/practitioner-access/:accessId/revoke",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin"] }),
  validateRequest(AccessIdParamsSchema, "params"),
  revokePractitionerAccess
);

router.get(
  "/:patientId/episodes",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "practitioner", "patient"] }),
  getEpisodes
);

router.post(
  "/:patientId/episodes",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  validateRequest(NewEpisodeLabelSchema),
  createEpisode
);

router.get(
  "/:patientId/summaries",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner", "admin", "patient"] }),
  getPatientSummaries
);

router.post(
  "/:patientId/summaries",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  validateRequest(NewSummarySchema),
  createSummary
);

router.get(
  "/:patientId/clinical-entries",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner", "admin", "patient"] }),
  getClinicalEntries
);

router.post(
  "/:patientId/clinical-entries",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  validateRequest(NewClinicalEntrySchema),
  createClinicalEntry
);

router.get(
  "/:patientId/appointments",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "patient", "provider"] }),
  listAppointments
);

router.post(
  "/:patientId/appointments",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "provider", "practitioner"] }),
  validateRequest(CreateAppointmentSchema),
  createAppointment
);

router.patch(
  "/:patientId/appointments/:appointmentId/check-in",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "provider"] }),
  validateObjectId("appointmentId"),
  checkInAppointment
);

router.get(
  "/:patientId/invoices",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "patient", "provider"] }),
  listInvoices
);

router.post(
  "/:patientId/invoices",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "provider"] }),
  validateRequest(CreateInvoiceSchema),
  createInvoice
);

router.patch(
  "/:patientId/invoices/:invoiceId/mark-paid",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "provider"] }),
  validateObjectId("invoiceId"),
  markInvoicePaid
);

router.get(
  "/:patientId/invoices/:invoiceId/payments",
  verifyAuthentication,
  requirePatientAccess(),
  validateObjectId("invoiceId"),
  listPayments
);

router.post(
  "/:patientId/invoices/:invoiceId/payments",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "provider"] }),
  validateObjectId("invoiceId"),
  validateRequest(CreatePaymentSchema),
  createPayment
);

router.get(
  "/:patientId/consent-forms",
  verifyAuthentication,
  requirePatientAccess(),
  listConsentForms
);

router.post(
  "/:patientId/consent-forms",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] }),
  upload.single("document"),
  validateRequest(CreateConsentFormSchema),
  createConsentForm
);

router.patch(
  "/:patientId/consent-forms/:consentFormId/sign",
  verifyAuthentication,
  requirePatientAccess({ roles: ["patient"] }),
  validateObjectId("consentFormId"),
  signConsentForm
);

export default router;
