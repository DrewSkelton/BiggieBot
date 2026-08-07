import {
  ChatInputCommandInteraction,
  ClientEvents,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js"
import { drizzle } from "drizzle-orm/libsql/sqlite3"

export const db = drizzle(process.env.SQLITE_URL || "file:database.sqlite3", {
  casing: "snake_case",
})

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
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>

  constructor(
    data:
      | SlashCommandBuilder
      | SlashCommandOptionsOnlyBuilder
      | SlashCommandSubcommandsOnlyBuilder,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
  ) {
    this.data = data
    this.execute = execute
  }
}
