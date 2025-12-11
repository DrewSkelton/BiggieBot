import { Snowflake } from "discord.js"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const countingChannels = sqliteTable("counting_channels", {
  channel: text().$type<Snowflake>().primaryKey(),
  count: integer().notNull().default(0),
  highest: integer().notNull().default(0),
  last: text().notNull().$type<Snowflake>().default(""),
})
