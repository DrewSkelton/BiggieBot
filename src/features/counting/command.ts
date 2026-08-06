import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import { db, SlashCommand } from "../../shared.js"
import { countingChannels } from "./schema.js"
import { eq } from "drizzle-orm"

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("counting")
    .setDescription("Manages counting.")
    .addSubcommand((highscore) =>
      highscore
        .setName("highscore")
        .setDescription("Returns the highest count achieved in this channel."),
    )
    .addSubcommand((set) =>
      set
        .setName("set")
        .setDescription("Sets the current channel for counting."),
    )
    .addSubcommand((remove) =>
      remove
        .setName("remove")
        .setDescription("Removes the current channel from counting.")
        .addBooleanOption((option) =>
          option
            .setName("all")
            .setDescription("Removes every channel from counting."),
        ),
    ),

  async (interaction) => {
    switch (interaction.options.getSubcommand()) {
      case "highscore":
        await highscore(interaction)
        break
      case "set":
        await set(interaction)
        break
      case "remove":
        await remove(interaction)
        break
    }
  },
)

async function set(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({
      content: "❌ You do not have permission to manage channels.",
      flags: MessageFlags.Ephemeral,
    })
    return
  }

  const rows = await db
    .insert(countingChannels)
    .values({ channel: interaction.channel!.id })
    .onConflictDoNothing()
    .returning()
  if (rows.length)
    await interaction.reply(
      "This channel has been set as a counting channel! Start counting from 1.",
    )
  else await interaction.reply("❌ This channel is already a counting channel.")
}

async function remove(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({
      content: "❌ You do not have permission to manage channels.",
      flags: MessageFlags.Ephemeral,
    })
    return
  }

  const result = await db
    .delete(countingChannels)
    .where(eq(countingChannels.channel, interaction.channel!.id))
  if (result.rowsAffected)
    await interaction.reply(
      "This channel has been removed as the counting channel!",
    )
  else await interaction.reply("❌ This channel is not a counting channel.")
}

async function highscore(interaction: ChatInputCommandInteraction) {
  const rows = await db
    .select()
    .from(countingChannels)
    .where(eq(countingChannels.channel, interaction.channel!.id))
  if (rows.at(0))
    await interaction.reply(
      `The highest count for this channel is **${rows.at(0)!.highest}**!`,
    )
  else await interaction.reply("❌ This channel is not a counting channel.")
}
