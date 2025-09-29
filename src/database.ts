import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"

export const db = drizzle("pglite", {
  casing: "snake_case",
})

await migrate(db, { migrationsFolder: "drizzle" })
