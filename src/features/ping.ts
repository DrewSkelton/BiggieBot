import {
  ChatInputCommandInteraction,
  Events,
  Message,
  SlashCommandBuilder,
} from "discord.js"
import { Event, SlashCommand } from "../shared.js"

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("")
  },
)

export const event = new Event(
  Events.MessageCreate,

  async (message: Message) => {
    if (!message.author.bot && message.content == "Ping!") {
      await message.reply("Pong")
    }
  },
)
