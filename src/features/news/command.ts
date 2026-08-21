import { SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../../shared.js"
import { readdir, readFile, stat } from "fs/promises"
import path from "path"

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("news")
    .setDescription("Get the latest bot news.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How many news entries to show. Defaults to 2.")
        .setMinValue(1),
    ),
  async (interaction) => {
    const files: [number, string][] = []

    for (const relativePath of await readdir("data/news")) {
      if (relativePath.endsWith(".md")) {
        const fullPath = path.resolve("data/news", relativePath)
        files.push([(await stat(fullPath)).birthtimeMs, fullPath])
      }
    }

    // Sort by file creation date
    files.sort((a, b) => b[0] - a[0])

    const amount = interaction.options.getInteger("amount") || 2

    await interaction.deferReply()
    for (let i = 0; i < amount && i < files.length; i++) {
      const creationSeconds = Math.trunc(files[i][0] / 1000)
      const message =
        (await readFile(files[i][1])).toString() +
        `\n-# <t:${creationSeconds}:f>`
      await interaction.followUp(message)
    }

    if (!interaction.replied) await interaction.followUp(":x: There is no news")
  },
)
