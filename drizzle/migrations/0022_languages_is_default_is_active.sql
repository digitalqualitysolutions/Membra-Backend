ALTER TABLE "app"."languages" ADD COLUMN "is_default" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."languages" RENAME COLUMN "active" TO "is_active";--> statement-breakpoint
-- Exactly one default language: prefer `da`, else lowest id.
UPDATE "app"."languages" SET "is_default" = false;--> statement-breakpoint
UPDATE "app"."languages" SET "is_default" = true
WHERE "id" = (
	SELECT "id" FROM "app"."languages"
	ORDER BY CASE WHEN "id" = 'da' THEN 0 ELSE 1 END, "id"
	LIMIT 1
);--> statement-breakpoint
ALTER TABLE "app"."languages" ALTER COLUMN "is_default" SET DEFAULT false;--> statement-breakpoint
CREATE UNIQUE INDEX "languages_one_default" ON "app"."languages" ("is_default") WHERE "is_default" IS TRUE;
