import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const countingTable = pgTable("counting", {
  id: text().primaryKey(),
  count: integer().default(0),
  highest: integer().default(0),
  last: text().default(''),
});