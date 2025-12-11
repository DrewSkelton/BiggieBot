import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "migrations",
  schema: "src/schema",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.SQLITE_URL || "file:database.sqlite3",
  },
})
