ALTER TABLE "daily_questions" DROP CONSTRAINT "daily_questions_i_unique";--> statement-breakpoint
ALTER TABLE "buzzwords" ADD PRIMARY KEY ("guild");--> statement-breakpoint
ALTER TABLE "counting_channels" ALTER COLUMN "count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "counting_channels" ALTER COLUMN "highest" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "counting_channels" ALTER COLUMN "last" SET NOT NULL;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'daily_questions'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "daily_questions" DROP CONSTRAINT "daily_questions_pkey";--> statement-breakpoint
ALTER TABLE "daily_questions" ADD PRIMARY KEY ("i");--> statement-breakpoint
ALTER TABLE "daily_questions" ADD CONSTRAINT "daily_questions_question_unique" UNIQUE("question");