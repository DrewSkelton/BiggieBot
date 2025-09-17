import "dotenv/config"
import { Config, defineConfig } from "drizzle-kit"

let config: Config
if (process.env.DATABASE_URL?.includes("://"))
  config = defineConfig({
    schema: "./src/schema",
    dialect: "postgresql",
    dbCredentials: {
      url: process.env.DATABASE_URL,
    },
  })
else
  config = defineConfig({
    schema: "./src/schema",
    dialect: "postgresql",
    driver: "pglite",
    dbCredentials: {
      url: process.env.DATABASE_URL ?? "pglite",
    },
  })

export default defineConfig(config)
