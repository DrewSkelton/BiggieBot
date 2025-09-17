import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: ["./src/schema", "./dist/schema/*.js"],
  dialect: "postgresql",
  driver: process.env.DATABASE_URL?.includes("://") ? undefined: "pglite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "pglite",
  },
})
