import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import { db, SlashCommand } from "../../shared.js"
import { honeypotTable } from "./schema.js"
import { eq, inArray } from "drizzle-orm"

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("honeypot")
    .setDescription("Set a channel to kick bots if they send a message to it.")
    .addSubcommand((option) =>
      option
        .setName("set")
        .setDescription(
          "Set a channel to kick bots if they send a message to it.",
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "The channel to set. Omit to use the current channel.",
            )
            .setRequired(false),
        ),
    )
    .addSubcommand((option) =>
      option
        .setName("unset")
        .setDescription("Unset a honeypot channel.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "The channel to unset. Omit to use the current channel.",
            )
            .setRequired(false),
        )
        .addBooleanOption((option) =>
          option
            .setName("all")
            .setDescription("Remove every honeypot channel."),
        ),
    )
    .addSubcommand((option) =>
      option
        .setName("list")
        .setDescription("List what channels are honeypots."),
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers + PermissionFlagsBits.ManageChannels,
    ),

  async (interaction) => {
    switch (interaction.options.getSubcommand()) {
      case "set":
        await set(interaction)
        break
      case "unset":
        await unset(interaction)
        break
      case "list":
        await list(interaction)
        break
    }
  },
)

async function set(interaction: ChatInputCommandInteraction) {
  const channel =
    interaction.options.getChannel("channel") || interaction.channel

  if (channel?.id == null) {
    await interaction.reply(":x: Not a valid channel")
    return
  }

  const result = await db
    .insert(honeypotTable)
    .values({ channel: channel.id })
    .onConflictDoNothing()

  if (result.rowsAffected == 0) {
    await interaction.reply(":x: This channel is already set")
  } else {
    await interaction.reply(":white_check_mark: Success!")
  }
}

async function unset(interaction: ChatInputCommandInteraction) {
  const channel =
    interaction.options.getChannel("channel") || interaction.channel

  if (channel?.id == null) {
    await interaction.reply(":x: Not a valid channel")
    return
  }

  let channels = []
  if (interaction.options.getBoolean("all")) {
    if (!interaction.guild?.channels) {
      await interaction.reply(':x: Cannot use "all" if there are no channels')
      return
    } else {
      for (const channel of interaction.guild.channels.cache || []) {
        channels.push(channel[0])
      }
    }
  } else {
    channels = [channel.id]
  }

  const result = await db
    .delete(honeypotTable)
    .where(inArray(honeypotTable.channel, channels))

  if (result.rowsAffected == 0) {
    await interaction.reply(":x: This channel is not set")
  } else {
    await interaction.reply(":white_check_mark: Success!")
  }
}

async function list(interaction: ChatInputCommandInteraction) {
  let channels = []
  for (const channel of interaction.guild?.channels.cache || []) {
    channels.push(channel[0])
  }

  const rows = await db
    .select()
    .from(honeypotTable)
    .where(inArray(honeypotTable.channel, channels))

  if (rows.length == 0) {
    await interaction.reply(":x: There are no channels set")
  } else {
    let reply = ""
    for (const row of rows) {
      reply += `<#${row.channel}>\n`
    }
    await interaction.reply(reply)
  }
}
