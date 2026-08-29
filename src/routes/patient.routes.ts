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
  handlePatientProfile
);

router.get(
  "/:patientId/summaries",
  verifyAuthentication,
  requirePatientUser,
  // verify patient access
  // verify practitioner/admin has access
  getPatientSummaries
);

export default router;
