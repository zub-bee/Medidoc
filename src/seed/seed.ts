import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function insert(table: string, row: Record<string, unknown>) {
  const columns = Object.keys(row);
  const values = Object.values(row);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `INSERT INTO "${table}" (${columns
    .map(c => `"${c}"`)
    .join(", ")}) VALUES (${placeholders})`;
  await pool.query(sql, values);
}

async function resetSeed() {
  await pool.query(`
    TRUNCATE TABLE
      "patient_summary_versions",
      "patient_summaries",
      "practitioner_access",
      "organization_access",
      "episodes",
      "practitioners",
      "admins",
      "patients",
      "platforms",
      "providers"
    RESTART IDENTITY CASCADE;
  `);
}

const id = () => randomUUID();
const now = () => new Date();
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export default async function main() {
  console.log("Seeding started.");

  await resetSeed();

  const orgId = id();
  await insert("providers", {
    id: orgId,
    name: "Lagos General Hospital",
    cac_number: "RC1234567",
    status: "verified",
    verified_at: daysAgo(200),
    created_at: daysAgo(200),
    updated_at: daysAgo(200)
  });

  await insert("platforms", {
    id: id(),
    name: "Chidi Okafor",
    email: "chidi@medidoc.platform",
    created_at: now(),
    updated_at: now()
  });

  const adminId = id();
  await insert("admins", {
    id: adminId,
    organization_id: orgId,
    name: "Amaka Nwosu",
    email: "amaka@lagosgeneral.ng",
    status: "active",
    created_at: daysAgo(180),
    updated_at: daysAgo(180)
  });

  const doctorId = id();
  await insert("practitioners", {
    id: doctorId,
    organization_id: orgId,
    name: "Dr. Funmi Adeyemi",
    email: "funmi.adeyemi@lagosgeneral.ng",
    approved_by: orgId,
    status: "active",
    created_at: daysAgo(150),
    updated_at: daysAgo(150)
  });

  const nurseId = id();
  await insert("practitioners", {
    id: nurseId,
    organization_id: orgId,
    name: "Nurse Ijeoma Bello",
    email: "ijeoma.bello@lagosgeneral.ng",
    approved_by: orgId,
    status: "active",
    created_at: daysAgo(150),
    updated_at: daysAgo(150)
  });

  const patientId = id();
  await insert("patients", {
    id: patientId,
    name: "Tunde Bakare",
    dob: "1990-04-12",
    gender: "male",
    address: "14 Adeola Odeku Street, Victoria Island, Lagos",
    phone: "+2348012345678",
    nin: "12345678901",
    email: "tunde.bakare@example.com",
    created_at: daysAgo(120),
    updated_at: daysAgo(120)
  });

  await insert("organization_access", {
    id: id(),
    patient_id: patientId,
    organization_id: orgId,
    status: "active",
    granted_at: daysAgo(120),
    revoked_at: null
  });

  await insert("practitioner_access", {
    id: id(),
    practitioner_id: doctorId,
    patient_id: patientId,
    granted_by: orgId,
    status: "active",
    granted_at: daysAgo(119),
    revoked_at: null
  });

  await insert("practitioner_access", {
    id: id(),
    practitioner_id: nurseId,
    patient_id: patientId,
    granted_by: orgId,
    status: "active",
    granted_at: daysAgo(119),
    revoked_at: null
  });

  const episodeId = id();
  await insert("episodes", {
    id: episodeId,
    patient_id: patientId,
    organization_id: orgId,
    label: "Admission — Appendicitis, Jan 2026",
    status: "closed",
    opened_at: daysAgo(30),
    closed_at: daysAgo(25)
  });

  await insert("patient_summaries", {
    id: id(),
    patient_id: patientId,
    episode_id: null,
    category: "problem_list",
    data: JSON.stringify({
      active: ["Hypertension"],
      resolved: ["Appendicitis (surgically treated, Jan 2026)"]
    }),
    version_no: 1,
    updated_by: doctorId,
    updated_at: daysAgo(25)
  });

  await insert("patient_summaries", {
    id: id(),
    patient_id: patientId,
    episode_id: null,
    category: "allergies",
    data: JSON.stringify([
      { substance: "Penicillin", reaction: "Rash", severity: "moderate" }
    ]),
    version_no: 1,
    updated_by: doctorId,
    updated_at: daysAgo(120)
  });

  await insert("patient_summaries", {
    id: id(),
    patient_id: patientId,
    episode_id: null,
    category: "family_history",
    data: JSON.stringify([
      { relation: "father", condition: "Type 2 diabetes" },
      { relation: "mother", condition: "Hypertension" }
    ]),
    version_no: 1,
    updated_by: doctorId,
    updated_at: daysAgo(120)
  });

  const medsId = id();
  await insert("patient_summaries", {
    id: medsId,
    patient_id: patientId,
    episode_id: null,
    category: "medications",
    data: JSON.stringify([
      { name: "Lisinopril", dosage: "10mg daily", status: "active" },
      { name: "Amoxicillin", dosage: "500mg 3x daily", status: "past" }
    ]),
    version_no: 2,
    updated_by: doctorId,
    updated_at: daysAgo(10)
  });

  await insert("patient_summary_versions", {
    id: id(),
    summary_id: medsId,
    version_no: 1,
    data: JSON.stringify([
      { name: "Lisinopril", dosage: "5mg daily", status: "active" }
    ]),
    changed_by: doctorId,
    changed_at: daysAgo(60)
  });

  console.log("Seeding completed.");

  await pool.end();
}
