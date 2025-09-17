import { NodePgDatabase, drizzle as pgDrizzle } from "drizzle-orm/node-postgres"
import { PgliteDatabase, drizzle as pgliteDrizzle } from "drizzle-orm/pglite"

// The database can either be PostgreSQL, or PGLite, depending on the environment variable
let database:
  | NodePgDatabase<Record<string, never>>
  | PgliteDatabase<Record<string, never>>

if (process.env.DATABASE_URL?.includes("://"))
  database = pgDrizzle(process.env.DATABASE_URL, { casing: "snake_case" })
else
  database = pgliteDrizzle(process.env.DATABASE_URL ?? "pglite", {
    casing: "snake_case",
  })

export const db = database
