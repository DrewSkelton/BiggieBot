import { Snowflake } from "discord.js"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const honeypotTable = sqliteTable("honeypot", {
  channel: text().$type<Snowflake>().primaryKey(),
})
