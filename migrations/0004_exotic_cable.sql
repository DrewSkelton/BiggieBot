CREATE TABLE `buzzwords` (
	`guild` text NOT NULL,
	`trigger` text NOT NULL,
	`response` text NOT NULL,
	`owner` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `counting_channels` (
	`channel` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`highest` integer DEFAULT 0 NOT NULL,
	`last` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `currency_settings` (
	`guild` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`name_plural` text DEFAULT '' NOT NULL,
	`icon` text DEFAULT '$' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_balances` (
	`user` text NOT NULL,
	`guild` text,
	`balance` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user`, `guild`),
	CONSTRAINT "balance_positive" CHECK("user_balances"."balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE `daily_question_channels` (
	`channel` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_questions` (
	`i` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`author` text NOT NULL,
	`guild` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_questions_question_unique` ON `daily_questions` (`question`);--> statement-breakpoint
CREATE TABLE `increment` (
	`i` integer DEFAULT 0 NOT NULL
);
