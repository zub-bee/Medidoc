import { Router } from "express";
import { validateRequest } from "../middlewares/validate-request";
import { validateObjectId } from "../middlewares/validate-id";
import { verifyAuthentication } from "../middlewares/verify-auth";
import { requirePatientUser } from "../middlewares/require-patient";
import {
  handlePatientProfile,
  getPatientSummaries
} from "../controllers/patient.controller";

const router = Router();

router.get(
  "/me",
  verifyAuthentication,
  requirePatientUser,
  handlePatientProfile // this has to change back to use just patient id
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
  // verify patient access (requirepatientaccess)
  // verify practitioner/admin has access
  getPatientSummaries // change this to check for patient access not user
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
  verifyAuthentication
  // verify patient access (requirepatientaccess)
  // verify practitioner/admin has access
  // handler for appointments
);

router.post(
  "/:patient/appointments",
  // validate request body
  verifyAuthentication
  // require patient access
  // handler for appointments
);

router.get(
  "/:patientId/appointments",
  verifyAuthentication
  // verify patient access (requirepatientaccess)
  // verify practitioner/admin has access
  // handler for appointments
);

router.post(
  "/:patient/appointments",
  // validate request body
  verifyAuthentication
  // require patient access
  // handler for appointments
);

router.get(
  "/:patientId/invoices",
  verifyAuthentication
  // verify patient access (requirepatientaccess)
  // verify practitioner/admin has access
  // handler for invoices
);

router.post(
  "/:patient/invoices",
  // validate request body
  verifyAuthentication
  // require patient access
  // handler for invoices
);

router.get(
  "/:patientId/consent-forms",
  verifyAuthentication
  // verify patient access (requirepatientaccess)
  // verify practitioner/admin has access
  // handler for consent-forms
);

router.post(
  "/:patient/consent-forms",
  // validate request body
  verifyAuthentication
  // require patient access
  // handler for consent-forms
);

export default router;
