import { integer, pgTable, text } from "drizzle-orm/pg-core"

export const countingChannels = pgTable("counting_channels", {
  channel: text().primaryKey(),
  count: integer().notNull().default(0),
  highest: integer().notNull().default(0),
  last: text().notNull().default(""),
})
