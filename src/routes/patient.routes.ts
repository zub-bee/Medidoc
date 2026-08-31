import { Router } from "express";
import { validateRequest } from "../middlewares/validate-request";
import { validateObjectId } from "../middlewares/validate-id";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requirePatientUser } from "../middlewares/require-patient";
import { requirePatientAccess } from "../middlewares/require-patient-access";
import upload from "../middlewares/upload-file";
import {
  handlePatientProfile,
  getPatientSummaries
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

const router = Router();

router.get(
  "/me",
  verifyAuthentication,
  requirePatientUser,
  handlePatientProfile
);

router.get(
  "/:patientId",
  verifyAuthentication
  // require patient access
  // handler for Patient Profile
);

router.patch(
  "/:patientId",
  verifyAuthentication
  // require patient access
  // handler for Patient Profile
);

router.get(
  "/:patient/organization-access",
  verifyAuthentication
  // require access to this patient
  // handler for access list
);

router.post(
  // some of these paths should only support the
  // signed in patient user
  // simply because only one user would be doing this
  "/:patient/organization-access/:accessId/revoke",
  // validate request body
  verifyAuthentication,
  requirePatientUser
  // handler for access rovoke
);

router.post(
  "/:patient/organization-access",
  // validate req body
  verifyAuthentication,
  requirePatientUser
  // handler for access list
);

router.get(
  "/:patient/practitioner-access",
  verifyAuthentication
  // require access to this patient
  // handler for access list
);

router.post(
  // some of these paths should only support the
  // signed in patient user
  // simply because only one user would be doing this
  "/:patient/practitioner-access/:accessId/revoke",
  // validate request body
  verifyAuthentication,
  requirePatientUser
  // handler for access rovoke
);

router.post(
  "/:patient/practitioner-access",
  // validate req body
  verifyAuthentication
  // req patient access
  // handler for access list
);

router.get(
  "/:patient/practitioner-access",
  verifyAuthentication
  // require access to this patient
  // handler for access list
);

router.get(
  "/:patient/episodes",
  verifyAuthentication
  // requirepatientaccess
  // handler for episodes
);

router.post(
  "/:patient/episodes",
  // validate request body
  verifyAuthentication
  // require patient access
  // handler for episodes
);

router.get(
  "/:patientId/summaries",
  verifyAuthentication,
  requirePatientAccess(),
  getPatientSummaries
);

router.post(
  "/:patient/summaries",
  // validate request body
  verifyAuthentication
  // require patient access
  // handler for episodes
);

router.get(
  "/:patientId/clinical-entries",
  verifyAuthentication
  // verify patient access (requirepatientaccess)
  // verify practitioner/admin has access
  // handler for clinical entries
);

router.post(
  "/:patient/clinical-entries",
  // validate request body
  verifyAuthentication
  // require patient access
  // handler for clinical entries
);

router.get(
  "/:patientId/appointments",
  verifyAuthentication,
  requirePatientAccess(),
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
  requirePatientAccess(),
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
