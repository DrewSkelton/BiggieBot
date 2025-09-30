import { pgTable, text } from "drizzle-orm/pg-core"

export const buzzwords = pgTable("buzzwords", {
  guild: text().primaryKey(),
  trigger: text().notNull(),
  response: text().notNull(),
  owner: text().notNull(),
})
