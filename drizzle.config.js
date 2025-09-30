import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: ["src/schema", "dist/schema"],
  dialect: "postgresql",
  driver: "pglite",
  dbCredentials: {
    url: "pglite",
  },
})
