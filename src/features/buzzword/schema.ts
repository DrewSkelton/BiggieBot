import { Snowflake } from "discord.js"
import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core"

export const buzzwords = sqliteTable("buzzwords", {
  guild: text().$type<Snowflake>().notNull(),
  trigger: text().notNull(),
  response: text().notNull(),
  owner: text().$type<Snowflake>().notNull(),
  regex: integer().notNull().default(0)
})
