import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"

export const db = drizzle(process.env.SQLITE_URL || "file:database.sqlite3", {
  casing: "snake_case",
})

migrate(db, { migrationsFolder: "migrations" })
