import { ClientEvents, SlashCommandBuilder } from "discord.js"
import { migrate } from "drizzle-orm/libsql/migrator"
import { drizzle } from "drizzle-orm/libsql/sqlite3"

export const db = drizzle(process.env.SQLITE_URL || "file:database.sqlite3", {
  casing: "snake_case",
})

migrate(db, { migrationsFolder: "migrations" })

export class Event<Event extends keyof ClientEvents> {
  event: Event
  execute: (...args: any) => Promise<void>
  once: boolean = false

  constructor(event: Event, execute: (...args: any) => Promise<void>) {
    this.event = event
    this.execute = execute
  }
}

export class SlashCommand {
  data: SlashCommandBuilder
  execute: (...args: any) => Promise<void>

  constructor(
    data: SlashCommandBuilder,
    execute: (...args: any) => Promise<void>,
  ) {
    this.data = data
    this.execute = execute
  }
}
