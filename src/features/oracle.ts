import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../shared.js"
import { readFileSync } from "fs"

const dictionary = readFileSync("data/temple_os_vocab.txt")
  .toString()
  .split("\n")

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("oracle")
    .setDescription("A port of the Oracle program from TempleOS.")
    .addIntegerOption((option) =>
      option
        .setName("words")
        .setDescription(
          "The number of words to generate. Leave empty for a random amount.",
        )
        .setMinValue(1),
    ),
  async (interaction: ChatInputCommandInteraction) => {
    const words = interaction.options.getInteger("words")

    let reply = "**He says:** "

    for (let i = 0; !words || (i < words && reply.length < 1950); i++) {
      reply += dictionary[Math.floor(Math.random() * dictionary.length)] + " "
      // If no words are specified, then there will be a 5% chance to end the loop, resulting in a logarithmic distribution of random words
      if (!words && Math.random() < 0.05) break
    }

    await interaction.reply(reply)
  },
)
