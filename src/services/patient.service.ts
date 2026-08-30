import { eq, sql } from "drizzle-orm";
import { patients } from "../drizzle/schemas/patients.schema";
import db from "../configs/db";
import { patient_summaries, PatientSummary } from "@/drizzle";

export class PatientService {
  static async getPatientProfile(patientId: string) {
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId)
    });

    console.log(patient);

    return patient;
  }

  static async getPatientSummaries(patientId: string) {
    const data = await db
      .select({
        category: patient_summaries.category,
        summaries: sql<PatientSummary[]>`json_agg(${patient_summaries})`
      })
      .from(patient_summaries)
      .where(eq(patient_summaries.patientId, patientId))
      .groupBy(patient_summaries.category);

    // update the data structure for each category to have an array
    const summaries = Object.fromEntries(
      data.map(row => [row.category, row.summaries])
    );

    // remove category from summaries array
    const patientSummaries = Object.fromEntries(
      data.map(({ category, summaries }) => [
        category,
        summaries.map(({ category: _, patientId: __, ...rest }) => rest)
      ])
    );

    return patientSummaries;
  }
}
