import { Snowflake } from "discord.js"
import { sql } from "drizzle-orm"
import {
  check,
  int,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core"

export const userBalances = sqliteTable(
  "user_balances",
  {
    user: text().$type<Snowflake>().notNull(),
    guild: text().$type<Snowflake>(), // Guild is null if the user is using the bot in DMs
    balance: int().notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.user, table.guild] }),
    check("balance_positive", sql`${table.balance} >= 0`),
  ],
)

export const currencySettings = sqliteTable("currency_settings", {
  guild: text().$type<Snowflake>().primaryKey(), // Guild is replaced by a user id if the interaction takes place in DMs
  name: text().notNull().default(""),
  name_plural: text().notNull().default(""),
  icon: text().notNull().default("$"),
})
