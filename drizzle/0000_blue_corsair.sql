CREATE TABLE "buzzwords" (
	"guild" text NOT NULL,
	"trigger" text NOT NULL,
	"response" text NOT NULL,
	"owner" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counting_channels" (
	"channel" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0,
	"highest" integer DEFAULT 0,
	"last" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "daily_question_channels" (
	"channel" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_questions" (
	"question" text PRIMARY KEY NOT NULL,
	"author" text NOT NULL,
	"i" serial NOT NULL,
	CONSTRAINT "daily_questions_i_unique" UNIQUE("i")
);
