ALTER TABLE "practitioner_access" DROP CONSTRAINT "practitioner_access_granted_by_providers_id_fk";
--> statement-breakpoint
ALTER TABLE "practitioners" DROP CONSTRAINT "practitioners_approved_by_providers_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioner_access" ADD CONSTRAINT "practitioner_access_granted_by_admins_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_approved_by_admins_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;