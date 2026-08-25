CREATE TABLE "admins" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"practitioner_id" text NOT NULL,
	"scheduled_at" timestamp,
	"status" text NOT NULL,
	"checked_in_by" text,
	"checked_in_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"target_table" text,
	"target_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"practitioner_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"episode_id" text,
	"event_type" text NOT NULL,
	"data" json NOT NULL,
	"occurred_at" timestamp NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_forms" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"practitioner_id" text NOT NULL,
	"procedure_name" text NOT NULL,
	"document" json NOT NULL,
	"signed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"label" text,
	"status" text NOT NULL,
	"opened_at" timestamp,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"appointment_id" text,
	"amount" numeric(10, 2) NOT NULL,
	"status" text NOT NULL,
	"insurance_provider" text,
	"insurance_policy_number" text,
	"service_code" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_access" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"status" text NOT NULL,
	"granted_at" timestamp,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "patient_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"episode_id" text,
	"category" text NOT NULL,
	"data" json NOT NULL,
	"version_no" integer,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_summary_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"summary_id" text NOT NULL,
	"version_no" integer NOT NULL,
	"data" json NOT NULL,
	"changed_by" text,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"dob" date NOT NULL,
	"phone" text NOT NULL,
	"gender" text NOT NULL,
	"address" text,
	"nin" varchar(11) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patients_email_unique" UNIQUE("email"),
	CONSTRAINT "patients_nin_unique" UNIQUE("nin")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text,
	"amount" numeric(10, 2) NOT NULL,
	"method" text DEFAULT 'transfer' NOT NULL,
	"recorded_by" text NOT NULL,
	"paid_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platforms_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "practitioner_access" (
	"id" text PRIMARY KEY NOT NULL,
	"practitioner_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"granted_by" text NOT NULL,
	"status" text NOT NULL,
	"granted_at" timestamp,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "practitioners" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"approved_by" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "practitioners_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cac_number" varchar NOT NULL,
	"status" text NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "providers_cac_number_unique" UNIQUE("cac_number")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text,
	"actor_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"status" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text,
	"actor_id" text,
	"code_hash" text,
	"purpose" text,
	"expires_at" timestamp,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_organization_id_providers_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_status_providers_status_fk" FOREIGN KEY ("status") REFERENCES "public"."providers"("status") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organization_id_providers_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_practitioner_id_practitioners_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."practitioners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_entries" ADD CONSTRAINT "clinical_entries_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_entries" ADD CONSTRAINT "clinical_entries_practitioner_id_practitioners_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."practitioners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_entries" ADD CONSTRAINT "clinical_entries_organization_id_providers_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_entries" ADD CONSTRAINT "clinical_entries_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_forms" ADD CONSTRAINT "consent_forms_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_forms" ADD CONSTRAINT "consent_forms_organization_id_providers_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_forms" ADD CONSTRAINT "consent_forms_practitioner_id_practitioners_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."practitioners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_organization_id_providers_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_providers_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_access" ADD CONSTRAINT "organization_access_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_access" ADD CONSTRAINT "organization_access_organization_id_providers_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_summaries" ADD CONSTRAINT "patient_summaries_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_summaries" ADD CONSTRAINT "patient_summaries_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_summary_versions" ADD CONSTRAINT "patient_summary_versions_summary_id_patient_summaries_id_fk" FOREIGN KEY ("summary_id") REFERENCES "public"."patient_summaries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioner_access" ADD CONSTRAINT "practitioner_access_practitioner_id_practitioners_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."practitioners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioner_access" ADD CONSTRAINT "practitioner_access_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioner_access" ADD CONSTRAINT "practitioner_access_granted_by_providers_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_organization_id_providers_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_approved_by_providers_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;