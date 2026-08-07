import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { db, SlashCommand } from "../../shared.js"

// Slash Commands, Events, and Schemas that are exported will automatically be registered by the bot.
// It doesn't matter if it is `export default` or `export const NAME = `, it will still be registered.

// Slash commands are composed of two parts:
// 1. The "SlashCommandBuilder"
//    This tells Discord what the command is supposed to look like.
//    It gives users command completion.
// 2. The function to run when the command is fired.
// See https://discordjs.guide/legacy/app-creation/creating-commands
export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  async (interaction: ChatInputCommandInteraction) => {
    // Reply to the user
    await interaction.reply("Pong!")
  },
)
