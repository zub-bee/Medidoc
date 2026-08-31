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
  getPractiitonerAccess,
  revokePractitionerAccess,
  assignPractitionerAccess
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
import { UpdateProfileSchema } from "@/validators/auth";
import {
  UpdatePatientProfileSchema,
  OrganizationAccessSchema,
  PractitionerAccessSchema,
  AccessIdParamsSchema
} from "@/validators/patient";

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
  validateRequest(UpdatePatientProfileSchema),
  verifyAuthentication,
  requirePatientUser,
  checkUserAccountRestriction,
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
  validateRequest(OrganizationAccessSchema),
  verifyAuthentication,
  requirePatientUser,
  assignOrganizationAccess
);

router.post(
  "/:patientId/organization-access/:accessId/revoke",
  validateRequest(AccessIdParamsSchema, "params"),
  verifyAuthentication,
  requirePatientUser,
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
  validateRequest(PractitionerAccessSchema),
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin"] }),
  assignPractitionerAccess
);

router.post(
  "/:patientId/practitioner-access/:accessId/revoke",
  validateRequest(AccessIdParamsSchema, "params"),
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin"] }),
  revokePractitionerAccess
);

router.get(
  "/:patientId/episodes",
  verifyAuthentication,
  requirePatientAccess({ roles: ["admin", "practitioner", "patient"] })
  // handler for episodes
);

router.post(
  "/:patientId/episodes",
  // validate request body
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] })
  // handler for episodes
);

router.get(
  "/:patientId/summaries",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner", "admin", "patient"] }),
  getPatientSummaries
);

router.post(
  "/:patientId/summaries",
  // validate request body
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] })
  // handler for episodes
);

router.get(
  "/:patientId/clinical-entries",
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner", "admin", "patient"] })
  // handler for clinical entries
);

router.post(
  "/:patientId/clinical-entries",
  // validate request body
  verifyAuthentication,
  requirePatientAccess({ roles: ["practitioner"] })
  // handler for clinical entries
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
