import { Snowflake } from "discord.js"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const dailyQuestions = sqliteTable("daily_questions", {
  i: integer().primaryKey({ autoIncrement: true }), // An auto-incrementing integer used to keep track of the order
  question: text().notNull().unique(),
  author: text().$type<Snowflake>().notNull(),
  guild: text().$type<Snowflake>().notNull(),
})

export const dailyQuestionChannels = sqliteTable("daily_question_channels", {
  channel: text().$type<Snowflake>().primaryKey(),
})
