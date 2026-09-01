ALTER TABLE "platforms" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "platforms" ADD CONSTRAINT "platforms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platforms" ADD CONSTRAINT "platforms_user_id_unique" UNIQUE("user_id");