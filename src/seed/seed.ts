import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { hashPassword } from "../helpers/auth.helpers";

dotenv.config();

/** Shared demo password for every seeded user — see README for login instructions. */
const SEED_PASSWORD = "TestPass123!";

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
      "providers",
      "users"
    RESTART IDENTITY CASCADE;
  `);
}

const id = () => randomUUID();
const now = () => new Date();
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export default async function main() {
  console.log("Seeding started.");

  await resetSeed();

  const passwordHash = await hashPassword(SEED_PASSWORD);

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

  const platformUserId = id();
  await insert("users", {
    id: platformUserId,
    name: "Chidi Okafor",
    email: "chidi@medidoc.platform",
    password: passwordHash,
    role: "platform",
    is_email_verified: true,
    created_at: now(),
    updated_at: now()
  });

  await insert("platforms", {
    id: id(),
    user_id: platformUserId,
    name: "Chidi Okafor",
    email: "chidi@medidoc.platform",
    created_at: now(),
    updated_at: now()
  });

  const adminUserId = id();
  await insert("users", {
    id: adminUserId,
    name: "Amaka Nwosu",
    email: "amaka@lagosgeneral.ng",
    password: passwordHash,
    role: "admin",
    is_email_verified: true,
    created_at: daysAgo(180),
    updated_at: daysAgo(180)
  });

  const adminId = id();
  await insert("admins", {
    id: adminId,
    user_id: adminUserId,
    organization_id: orgId,
    name: "Amaka Nwosu",
    email: "amaka@lagosgeneral.ng",
    status: "verified",
    created_at: daysAgo(180),
    updated_at: daysAgo(180)
  });

  const doctorUserId = id();
  await insert("users", {
    id: doctorUserId,
    name: "Dr. Funmi Adeyemi",
    email: "funmi.adeyemi@lagosgeneral.ng",
    password: passwordHash,
    role: "practitioner",
    is_email_verified: true,
    created_at: daysAgo(150),
    updated_at: daysAgo(150)
  });

  const doctorId = id();
  await insert("practitioners", {
    id: doctorId,
    user_id: doctorUserId,
    organization_id: orgId,
    name: "Dr. Funmi Adeyemi",
    email: "funmi.adeyemi@lagosgeneral.ng",
    approved_by: adminId,
    status: "active",
    created_at: daysAgo(150),
    updated_at: daysAgo(150)
  });

  const nurseUserId = id();
  await insert("users", {
    id: nurseUserId,
    name: "Nurse Ijeoma Bello",
    email: "ijeoma.bello@lagosgeneral.ng",
    password: passwordHash,
    role: "practitioner",
    is_email_verified: true,
    created_at: daysAgo(150),
    updated_at: daysAgo(150)
  });

  const nurseId = id();
  await insert("practitioners", {
    id: nurseId,
    user_id: nurseUserId,
    organization_id: orgId,
    name: "Nurse Ijeoma Bello",
    email: "ijeoma.bello@lagosgeneral.ng",
    approved_by: adminId,
    status: "active",
    created_at: daysAgo(150),
    updated_at: daysAgo(150)
  });

  const patientUserId = id();
  await insert("users", {
    id: patientUserId,
    name: "Tunde Bakare",
    email: "tunde.bakare@example.com",
    password: passwordHash,
    role: "patient",
    is_email_verified: true,
    created_at: daysAgo(120),
    updated_at: daysAgo(120)
  });

  const patientId = id();
  await insert("patients", {
    id: patientId,
    user_id: patientUserId,
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
    organization_id: orgId,
    granted_by: adminId,
    status: "active",
    granted_at: daysAgo(119),
    revoked_at: null
  });

  await insert("practitioner_access", {
    id: id(),
    practitioner_id: nurseId,
    patient_id: patientId,
    organization_id: orgId,
    granted_by: adminId,
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

  console.log(
    `Seeding completed. All seeded users share the password: ${SEED_PASSWORD}`
  );

  await pool.end();
}
