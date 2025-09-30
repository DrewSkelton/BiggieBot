import fs from "node:fs"
import path from "node:path"
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord.js"
import "dotenv/config"

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
      dirent.name != "index.ts" && // TODO: Update this to use dynamic name
      (path.extname(dirent.name) == ".js" || path.extname(dirent.name) == ".ts")
    ) {
      yield path.join(searchPath, dirent.name)
    }
  }
}

const files = recurseDirectory("").toArray()

//Client object
const client = Object.assign(
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  }),
  {
    commands: new Collection(),
  },
)

// Stores information used for command registration
const commands: RESTPostAPIApplicationCommandsJSONBody[] = []

// Create events
for (const file of files) {
  const imp = await import(file)

  if (imp.execute) {
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
  }
}

// Create command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  const command: any = client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    try {
      // Intentionally send an incorrect message to get Discord's default error message sent to the client
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp("")
      } else {
        await interaction.reply("")
      }
    } catch {}
  }
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

    console.log(`Successfully reloaded ${commands.length} slash commands.`)
  } catch (error) {
    console.error(error)
  }
})()
