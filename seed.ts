// seed.ts
// Fills the database with realistic dev data.
// Run with: npx tsx seed.ts
//
// Setup:
//   npm install pg dotenv
//   npm install -D tsx @types/pg @types/node
//   Add DATABASE_URL to a .env file, e.g.
//   DATABASE_URL=postgres://user:password@localhost:5432/medidoc

import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Small helper so every insert reads the same way.
async function insert(table: string, row: Record<string, unknown>) {
  const columns = Object.keys(row);
  const values = Object.values(row);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`;
  await pool.query(sql, values);
}

const id = () => crypto.randomUUID();
const now = () => new Date();
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function main() {
  console.log("Seeding started.");

  // ── Provider organization ──────────────────────────────
  const orgId = id();
  await insert("providers", {
    id: orgId,
    name: "Lagos General Hospital",
    cac_number: "RC1234567",
    status: "verified",
    verified_at: daysAgo(200),
    created_at: daysAgo(200),
    updated_at: daysAgo(200),
  });

  // ── Platform admin ─────────────────────────────────────
  const platformUserId = id();
  await insert("platforms", {
    id: id(),
    name: "Chidi Okafor",
    email: "chidi@medidoc.platform",
    created_at: now(),
    updated_at: now(),
  });

  await insert("users", {
    id: platformUserId,
    name: "Chidi Okafor",
    email: "chidi@medidoc.platform",
    password: "hashed_password_placeholder",
    role: "platform",
    is_email_verified: true,
    provider: "local",
    created_at: now(),
    updated_at: now(),
  });

  // ── Org admins (billing, check-in — no medical access) ─
  const adminId = id();
  await insert("admins", {
    id: adminId,
    organization_id: orgId,
    name: "Amaka Nwosu",
    email: "amaka@lagosgeneral.ng",
    status: "active",
    created_at: daysAgo(180),
    updated_at: daysAgo(180),
  });

  await insert("users", {
    id: adminId,
    name: "Amaka Nwosu",
    email: "amaka@lagosgeneral.ng",
    password: "hashed_password_placeholder",
    role: "admin",
    is_email_verified: true,
    provider: "local",
    created_at: daysAgo(180),
    updated_at: daysAgo(180),
  });

  // ── Practitioners (doctors — medical access only) ──────
  const doctorId = id();
  await insert("practitioners", {
    id: doctorId,
    organization_id: orgId,
    name: "Dr. Funmi Adeyemi",
    email: "funmi.adeyemi@lagosgeneral.ng",
    approved_by: orgId,
    status: "active",
    created_at: daysAgo(150),
    updated_at: daysAgo(150),
  });

  await insert("users", {
    id: doctorId,
    name: "Dr. Funmi Adeyemi",
    email: "funmi.adeyemi@lagosgeneral.ng",
    password: "hashed_password_placeholder",
    role: "practitioner",
    is_email_verified: true,
    provider: "local",
    created_at: daysAgo(150),
    updated_at: daysAgo(150),
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
    updated_at: daysAgo(150),
  });

  await insert("users", {
    id: nurseId,
    name: "Nurse Ijeoma Bello",
    email: "ijeoma.bello@lagosgeneral.ng",
    password: "hashed_password_placeholder",
    role: "practitioner",
    is_email_verified: true,
    provider: "local",
    created_at: daysAgo(150),
    updated_at: daysAgo(150),
  });

  // ── Patient (demographics) ─────────────────────────────
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
    updated_at: daysAgo(120),
  });

  await insert("users", {
    id: patientId,
    name: "Tunde Bakare",
    email: "tunde.bakare@example.com",
    password: "hashed_password_placeholder",
    role: "patient",
    is_email_verified: true,
    provider: "local",
    created_at: daysAgo(120),
    updated_at: daysAgo(120),
  });

  // ── Access control ─────────────────────────────────────
  await insert("organization_access", {
    id: id(),
    patient_id: patientId,
    organization_id: orgId,
    status: "active",
    granted_at: daysAgo(120),
    revoked_at: null,
  });

  await insert("practitioner_access", {
    id: id(),
    practitioner_id: doctorId,
    patient_id: patientId,
    granted_by: orgId,
    status: "active",
    granted_at: daysAgo(119),
    revoked_at: null,
  });

  await insert("practitioner_access", {
    id: id(),
    practitioner_id: nurseId,
    patient_id: patientId,
    granted_by: orgId,
    status: "active",
    granted_at: daysAgo(119),
    revoked_at: null,
  });

  // ── Episode (hospital admission) ───────────────────────
  const episodeId = id();
  await insert("episodes", {
    id: episodeId,
    patient_id: patientId,
    organization_id: orgId,
    label: "Admission — Appendicitis, Jan 2026",
    status: "closed",
    opened_at: daysAgo(30),
    closed_at: daysAgo(25),
  });

  // ── Patient summaries (persistent + episodic data) ─────
  // Medical history: past illnesses / surgeries / family history / allergies
  await insert("patient_summaries", {
    id: id(),
    patient_id: patientId,
    episode_id: null,
    category: "problem_list",
    data: JSON.stringify({
      active: ["Hypertension"],
      resolved: ["Appendicitis (surgically treated, Jan 2026)"],
    }),
    version_no: 1,
    updated_by: doctorId,
    updated_at: daysAgo(25),
  });

  await insert("patient_summaries", {
    id: id(),
    patient_id: patientId,
    episode_id: null,
    category: "allergies",
    data: JSON.stringify([
      { substance: "Penicillin", reaction: "Rash", severity: "moderate" },
    ]),
    version_no: 1,
    updated_by: doctorId,
    updated_at: daysAgo(120),
  });

  await insert("patient_summaries", {
    id: id(),
    patient_id: patientId,
    episode_id: null,
    category: "family_history",
    data: JSON.stringify([
      { relation: "father", condition: "Type 2 diabetes" },
      { relation: "mother", condition: "Hypertension" },
    ]),
    version_no: 1,
    updated_by: doctorId,
    updated_at: daysAgo(120),
  });

  // Medications: current and past
  const medsId = id();
  await insert("patient_summaries", {
    id: medsId,
    patient_id: patientId,
    episode_id: null,
    category: "medications",
    data: JSON.stringify([
      { name: "Lisinopril", dosage: "10mg daily", status: "active" },
      { name: "Amoxicillin", dosage: "500mg 3x daily", status: "past" },
    ]),
    version_no: 2,
    updated_by: doctorId,
    updated_at: daysAgo(10),
  });

  // Old version of the medications summary, kept for history
  await insert("patient_summary_versions", {
    id: id(),
    summary_id: medsId,
    version_no: 1,
    data: JSON.stringify([
      { name: "Lisinopril", dosage: "5mg daily", status: "active" },
    ]),
    changed_by: doctorId,
    changed_at: daysAgo(60),
  });

  // Immunizations
  await insert("patient_summaries", {
    id: id(),
    patient_id: patientId,
    episode_id: null,
    category: "vaccinations",
    data: JSON.stringify([
      { vaccine: "Hepatitis B", date_given: "2020-03-01" },
      { vaccine: "Yellow Fever", date_given: "2021-06-15" },
    ]),
    version_no: 1,
    updated_by: nurseId,
    updated_at: daysAgo(100),
  });

  // Care plan, scoped to the appendicitis episode
  await insert("patient_summaries", {
    id: id(),
    patient_id: patientId,
    episode_id: episodeId,
    category: "care_plan",
    data: JSON.stringify({
      goal: "Full recovery from appendectomy",
      instructions: ["Rest for 2 weeks", "Follow-up in 10 days", "No heavy lifting"],
    }),
    version_no: 1,
    updated_by: doctorId,
    updated_at: daysAgo(25),
  });

  // ── Clinical entries (event data) ──────────────────────
  // Vital signs
  await insert("clinical_entries", {
    id: id(),
    patient_id: patientId,
    practitioner_id: nurseId,
    organization_id: orgId,
    episode_id: episodeId,
    event_type: "vital_signs",
    data: JSON.stringify({
      blood_pressure: "128/82",
      heart_rate: 76,
      temperature_celsius: 37.1,
      weight_kg: 78,
      height_cm: 175,
    }),
    occurred_at: daysAgo(30),
    recorded_at: daysAgo(30),
  });

  // Progress note
  await insert("clinical_entries", {
    id: id(),
    patient_id: patientId,
    practitioner_id: doctorId,
    organization_id: orgId,
    episode_id: episodeId,
    event_type: "progress_note",
    data: JSON.stringify({
      note: "Patient presented with lower right abdominal pain. Working diagnosis: acute appendicitis. Scheduled for surgery.",
    }),
    occurred_at: daysAgo(30),
    recorded_at: daysAgo(30),
  });

  // Lab result
  await insert("clinical_entries", {
    id: id(),
    patient_id: patientId,
    practitioner_id: doctorId,
    organization_id: orgId,
    episode_id: episodeId,
    event_type: "lab_result",
    data: JSON.stringify({
      test: "Full Blood Count",
      result: { wbc: "14.2 x10^9/L", note: "elevated, consistent with infection" },
    }),
    occurred_at: daysAgo(30),
    recorded_at: daysAgo(29),
  });

  // Radiology
  await insert("clinical_entries", {
    id: id(),
    patient_id: patientId,
    practitioner_id: doctorId,
    organization_id: orgId,
    episode_id: episodeId,
    event_type: "radiology",
    data: JSON.stringify({
      scan_type: "Abdominal CT",
      findings: "Inflamed appendix, no rupture.",
      image_url: "https://storage.example.com/scans/tunde-bakare-ct-2026-01.dcm",
    }),
    occurred_at: daysAgo(30),
    recorded_at: daysAgo(30),
  });

  // ── Consent form ────────────────────────────────────────
  await insert("consent_forms", {
    id: id(),
    patient_id: patientId,
    practitioner_id: doctorId,
    organization_id: orgId,
    procedure_name: "Appendectomy",
    document: JSON.stringify({
      public_id: "consent/tunde-bakare-appendectomy",
      url: "https://storage.example.com/consent/tunde-bakare-appendectomy.pdf",
      size: 45000
    }),
    signed_at: daysAgo(30),
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
  });

  // ── Appointment, invoice, payment ──────────────────────
  const appointmentId = id();
  await insert("appointments", {
    id: appointmentId,
    patient_id: patientId,
    organization_id: orgId,
    practitioner_id: doctorId,
    scheduled_at: daysAgo(10),
    status: "completed",
    checked_in_by: adminId,
    checked_in_at: daysAgo(10),
    created_at: daysAgo(12),
  });

  const invoiceId = id();
  await insert("invoices", {
    id: invoiceId,
    patient_id: patientId,
    organization_id: orgId,
    appointment_id: appointmentId,
    amount: 45000.0,
    status: "paid",
    insurance_provider: "AXA Mansard",
    insurance_policy_number: "AXM-2026-88213",
    service_code: "CPT-44970",
    created_by: adminId,
    created_at: daysAgo(10),
  });

  await insert("payments", {
    id: id(),
    invoice_id: invoiceId,
    amount: 45000.0,
    method: "card",
    recorded_by: adminId,
    paid_at: daysAgo(9),
  });

  // ── Refresh tokens ──────────────────────────────────────
  // Store only the hash. Never store the raw token.
  await insert("refresh_tokens", {
    id: id(),
    role: "patient",
    actor_id: patientId,
    token_hash: "hashed_refresh_token_placeholder_1",
    status: "active",
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    created_at: now(),
    updated_at: now(),
    revoked_at: null,
  });

  await insert("refresh_tokens", {
    id: id(),
    role: "practitioner",
    actor_id: doctorId,
    token_hash: "hashed_refresh_token_placeholder_2",
    status: "active",
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    created_at: now(),
    updated_at: now(),
    revoked_at: null,
  });

  // A revoked one, so you can see that path too
  await insert("refresh_tokens", {
    id: id(),
    role: "admin",
    actor_id: adminId,
    token_hash: "hashed_refresh_token_placeholder_3",
    status: "revoked",
    expires_at: daysAgo(-5),
    created_at: daysAgo(20),
    updated_at: daysAgo(15),
    revoked_at: daysAgo(15),
  });

  // ── Verification codes (NIN, CAC, email) ───────────────
  await insert("verification_codes", {
    id: id(),
    role: "patient",
    actor_id: patientId,
    code_hash: "hashed_code_placeholder_1",
    purpose: "nin_verification",
    expires_at: daysAgo(119),
    used_at: daysAgo(120),
    created_at: daysAgo(120),
    updated_at: daysAgo(120),
  });

  await insert("verification_codes", {
    id: id(),
    role: "provider",
    actor_id: orgId,
    code_hash: "hashed_code_placeholder_2",
    purpose: "cac_verification",
    expires_at: daysAgo(199),
    used_at: daysAgo(200),
    created_at: daysAgo(200),
    updated_at: daysAgo(200),
  });

  // ── Audit trail ─────────────────────────────────────────
  await insert("audit_logs", {
    id: id(),
    actor_type: "practitioner",
    actor_id: doctorId,
    action: "update",
    target_table: "patient_summaries",
    target_id: medsId,
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
  });

  console.log("Seeding finished.");
  console.log("Patient ID:", patientId);
  console.log("Doctor ID:", doctorId);
  console.log("Admin ID:", adminId);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
