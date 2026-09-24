ALTER TABLE "app"."club_addresses" ADD COLUMN "country_code" varchar(2);--> statement-breakpoint
ALTER TABLE "app"."club_addresses" DROP COLUMN "country_id";
