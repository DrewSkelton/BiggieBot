import fs from "node:fs"
import path from "node:path"
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord.js"
import "dotenv/config"
import { db, Event, SlashCommand } from "./shared.js"
import { migrate } from "drizzle-orm/libsql/migrator"

// Helper function to recurse through an entire directory for commands or events
function* recurseDirectory(searchPath: string): Generator<string> {
  searchPath = path.resolve(import.meta.dirname, searchPath)
  // Dirent is short for directory entity chat
  const dirents = fs.readdirSync(searchPath, { withFileTypes: true })
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      yield* recurseDirectory(path.join(searchPath, dirent.name))
    } else if (
      dirent.isFile() &&
      // Matches all .js and .ts files, excluding
      // main.js
      // main.ts
      // *.d.ts
      dirent.name.match(/^(?!main\.[tj]s$)(?!.*\.d\.ts$).*\.[tj]s$/)
    ) {
      yield path.join(searchPath, dirent.name)
    }
  }
}

const files = recurseDirectory("").toArray()

// Migrate database
await migrate(db, { migrationsFolder: "migrations" })

//Client object
const client = Object.assign(
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
  }),
  {
    commands: new Collection(),
  },
)

// Stores information used for command registration
const commands: RESTPostAPIApplicationCommandsJSONBody[] = []

// Create events
for (const file of files) {
  // Relative path name for logging
  const relative = path.relative(import.meta.dirname, file)

  for (const value of Object.values(await import(file))) {
    if (value instanceof SlashCommand) {
      commands.push(value.data.toJSON())
      client.commands.set(value.data.name, value.execute)
      console.log(`Created the ${value.data.name} command`)
    } else if (value instanceof Event) {
      if (value.once) {
        client.once(value.event, (...args) =>
          value
            .execute(...args)
            .then()
            .catch(console.error),
        )
        console.log(`Created a one-time ${value.event} event for ${relative}`)
      } else {
        client.on(value.event, (...args) =>
          value
            .execute(...args)
            .then()
            .catch(console.error),
        )
        console.log(`Created a ${value.event} event for ${relative}`)
      }
    }
  }

  /*if (imp.execute) {
    if (imp.command) {
      commands.push(imp.command.toJSON())
      client.commands.set(imp.command.name, imp)
      console.log(`Created ${imp.command.name} command.`)
    } else if (imp.on) {
      client.on(imp.on, (...args) =>
        imp
          .execute(...args)
          .then()
          .catch(console.error),
      )
    } else if (imp.once) {
      client.once(imp.once, (...args) =>
        imp
          .execute(...args)
          .then()
          .catch(console.error),
      )
    }
    }*/
}

// Create command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  const command: any = client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  command(interaction)
    .then()
    .catch(async (error: any) => {
      console.error(error)

      try {
        // Intentionally send an incorrect message to get Discord's default error message sent to the client
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp("")
        } else {
          await interaction.reply("")
        }
      } catch {}
    })
})

await client.login(process.env.DISCORD_TOKEN?.trim())

// Register commands
const rest = new REST().setToken(client.token!)
;(async () => {
  try {
    // The put method is used to fully refresh all commands with the current set
    await rest.put(Routes.applicationCommands(client.user!.id), {
      body: commands,
    })

    console.log(`Successfully reloaded ${commands.length} slash commands`)
  } catch (error) {
    console.error(error)
  }
})()
