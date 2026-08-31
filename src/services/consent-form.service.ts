import { and, desc, eq } from "drizzle-orm";
import db from "../configs/db";
import { consent_forms } from "../drizzle/schemas/consent-forms.schema";
import { ApiError } from "../utils/api-error";
import { CreateConsentFormType } from "../validators/consent-form";

export type ConsentFormDocument = {
  public_id: string;
  url: string;
  size: number;
};

export class ConsentFormService {
  static async listByPatient(patientId: string) {
    return db
      .select()
      .from(consent_forms)
      .where(eq(consent_forms.patientId, patientId))
      .orderBy(desc(consent_forms.createdAt));
  }

  static async create(
    patientId: string,
    organizationId: string,
    practitionerId: string,
    document: ConsentFormDocument,
    { procedureName }: CreateConsentFormType
  ) {
    const [consentForm] = await db
      .insert(consent_forms)
      .values({
        patientId,
        organizationId,
        practitionerId,
        procedureName,
        document
      })
      .returning();

    return consentForm;
  }

  static async sign(patientId: string, consentFormId: string) {
    const [consentForm] = await db
      .select()
      .from(consent_forms)
      .where(
        and(
          eq(consent_forms.id, consentFormId),
          eq(consent_forms.patientId, patientId)
        )
      )
      .limit(1);

    if (!consentForm) {
      throw ApiError.notFound("Consent form not found for this patient");
    }

    if (consentForm.signedAt) {
      return consentForm;
    }

    const [signedConsentForm] = await db
      .update(consent_forms)
      .set({ signedAt: new Date() })
      .where(eq(consent_forms.id, consentFormId))
      .returning();

    return signedConsentForm;
  }
}
