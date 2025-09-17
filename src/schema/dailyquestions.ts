import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const dailyQuestions = pgTable("daily_questions", {
    question: text().primaryKey(),
    author: text().notNull(),
    i: serial().unique(), // An auto-incrementing integer used to keep track of the order
});

export const dailyQuestionChannels = pgTable("daily_question_channels", {
    channel: text().primaryKey(),
});