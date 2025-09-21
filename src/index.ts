import fs from "node:fs"
import path from "node:path"
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
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
      (path.extname(dirent.name) == ".js" || path.extname(dirent.name) == ".ts")
    ) {
      yield path.join(searchPath, dirent.name)
    }
  }
}

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

// Create commands
for (const file of recurseDirectory("commands")) {
  try {
    const command = await import(file)
    if (command.command) {
      commands.push(command.command.toJSON())
      client.commands.set(command.command.name, command)
    }
  } catch (error) {
    console.error(error)
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
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command",
        flags: MessageFlags.Ephemeral,
      })
    } else {
      await interaction.reply({
        content: "There was an error while executing this command",
        flags: MessageFlags.Ephemeral,
      })
    }
  }
})

// Create events
// TODO: Support key value mappings to events to handle multiple in the same file
for (const file of recurseDirectory("events")) {
  try {
    const event = await import(file)
    if (event.once) {
      client.once(event.once, (...args) => event.execute(...args))
    } else {
      client.on(event.on, (...args) => event.execute(...args))
    }
  } catch (error) {
    console.error(error)
  }
}

await client.login(process.env.DISCORD_TOKEN.trim())

// Register commands
const rest = new REST().setToken(client.token)
;(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    )

    // The put method is used to fully refresh all commands with the current set
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    })

    console.log(
      `Successfully reloaded ${commands.length} application (/) commands.`,
    )
  } catch (error) {
    console.error(error)
  }
})()
