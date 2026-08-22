import { Snowflake } from "discord.js"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const antiSpamTable = sqliteTable("anti_spam", {
  guild: text().$type<Snowflake>().primaryKey(),
})
