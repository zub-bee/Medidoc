ALTER TABLE "admins" DROP CONSTRAINT "admins_status_providers_status_fk";
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_status_providers_status_fk" FOREIGN KEY ("status") REFERENCES "public"."providers"("status") ON DELETE no action ON UPDATE no action;