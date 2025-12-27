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
