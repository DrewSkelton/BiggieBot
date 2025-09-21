import { integer, pgTable, text } from "drizzle-orm/pg-core"

export const countingChannels = pgTable("counting_channels", {
  channel: text().primaryKey(),
  count: integer().default(0),
  highest: integer().default(0),
  last: text().default(""),
})
