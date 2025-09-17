import "dotenv/config";
import { defineConfig } from "drizzle-kit";
let config;
if (process.env.DATABASE_URL?.includes("://"))
    config = defineConfig({
        schema: ["./src/schema", "./dist/schema/*.js"],
        dialect: "postgresql",
        dbCredentials: {
            url: process.env.DATABASE_URL,
        },
    });
else
    config = defineConfig({
        schema: ["./src/schema", "./dist/schema/*.js"],
        dialect: "postgresql",
        driver: "pglite",
        dbCredentials: {
            url: process.env.DATABASE_URL ?? "pglite",
        },
    });
export default defineConfig(config);