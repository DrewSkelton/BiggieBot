import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "migrations",
  // Drizzle does not support excluding patterns, and including main causes a circular dependency
  // Thus we must use a sub-folder
  schema: "src/features/**",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.SQLITE_URL || "file:database.sqlite3",
  },
})
