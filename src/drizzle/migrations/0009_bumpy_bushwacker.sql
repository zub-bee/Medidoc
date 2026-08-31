ALTER TABLE "practitioners" ALTER COLUMN "approved_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "practitioners" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "delete_failed_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "delete_lock_until" timestamp;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_admins_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_patient_id_idx" ON "appointments" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "appointments_organization_id_idx" ON "appointments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "clinical_entries_patient_id_idx" ON "clinical_entries" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "clinical_entries_organization_id_idx" ON "clinical_entries" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "clinical_entries_episode_id_idx" ON "clinical_entries" USING btree ("episode_id");--> statement-breakpoint
CREATE INDEX "consent_forms_patient_id_idx" ON "consent_forms" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "consent_forms_organization_id_idx" ON "consent_forms" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "episodes_patient_id_idx" ON "episodes" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "episodes_organization_id_idx" ON "episodes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invoices_patient_id_idx" ON "invoices" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "invoices_organization_id_idx" ON "invoices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_access_patient_id_idx" ON "organization_access" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "organization_access_organization_id_idx" ON "organization_access" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "patient_summaries_patient_id_idx" ON "patient_summaries" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "practitioner_access_patient_id_idx" ON "practitioner_access" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "practitioner_access_practitioner_id_idx" ON "practitioner_access" USING btree ("practitioner_id");--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_amount_non_negative" CHECK ("invoices"."amount" >= 0);--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_non_negative" CHECK ("payments"."amount" >= 0);