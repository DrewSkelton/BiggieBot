import { pgTable, serial, text } from "drizzle-orm/pg-core"

export const dailyQuestions = pgTable("daily_questions", {
  i: serial().primaryKey(), // An auto-incrementing integer used to keep track of the order
  question: text().notNull().unique(),
  author: text().notNull(),
})

export const dailyQuestionChannels = pgTable("daily_question_channels", {
  channel: text().primaryKey(),
})
