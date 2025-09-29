import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: ["./src/schema", "./dist/schema/*.js"],
  dialect: "postgresql",
  driver: "pglite",
  dbCredentials: {
    url: "pglite",
  },
})
