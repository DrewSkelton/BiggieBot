import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import { db } from "../database.js"
import {
  dailyQuestionChannels,
  dailyQuestions,
} from "../schema/dailyquestions.js"
import { eq } from "drizzle-orm"

const limit = 3

export const command = new SlashCommandBuilder()
  .setName("dailyquestion")
  .setDescription("Manages daily questions")
  .addSubcommand((set) =>
    set
      .setName("set")
      .setDescription("Sets the current channel to receive daily questions.")
  )
  .addSubcommand((remove) =>
    remove
      .setName("remove")
      .setDescription(
        "Removes the current channel from receiving daily questions."
      )
  )
  .addSubcommand((get) =>
    get.setName("get").setDescription("Get the current daily question.")
  )
  .addSubcommand((submit) =>
    submit
      .setName("submit")
      .setDescription("Submits your daily question.")
      .addStringOption((option) =>
        option
          .setName("question")
          .setDescription("The question to submit.")
          .setRequired(true)
      )
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case "set":
      return set(interaction)
    case "remove":
      return remove(interaction)
    case "get":
      return get(interaction)
    case "submit":
      return submit(interaction)
  }
}

async function set(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels))
    return interaction.reply({
      content: "❌ You do not have permission to manage channels.",
      flags: MessageFlags.Ephemeral,
    })

  const result = await db
    .insert(dailyQuestionChannels)
    .values({ channel: interaction.channel.id })
    .onConflictDoNothing()

  if (result.rows) {
    await interaction.reply(
      "✅ This channel has been set for daily questions! Questions will be posted here at 9 AM every day."
    )
  } else {
    await interaction.reply(
      "❌ This channel has already been added for daily questions."
    )
  }
}

async function remove(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels))
    return interaction.reply({
      content: "❌ You do not have permission to manage channels.",
      flags: MessageFlags.Ephemeral,
    })

  const result = await db
    .delete(dailyQuestionChannels)
    .where(eq(dailyQuestionChannels.channel, interaction.channel.id))

  if (result.rows) {
    await interaction.reply(
      "✅ This channel has been removed for daily questions!"
    )
  } else {
    await interaction.reply("❌ This channel is not added for daily questions.")
  }
}

async function submit(interaction: ChatInputCommandInteraction) {
  // See if the user has submitted the limit
  const select_rows = await db
    .select()
    .from(dailyQuestions)
    .where(eq(dailyQuestions.author, interaction.user.id))
  if (select_rows.length >= limit) {
    await interaction.reply({
      content: `❌ You can only submit up to ${limit} questions.`,
      flags: MessageFlags.Ephemeral,
    })
    return
  }

  const result = await db
    .insert(dailyQuestions)
    .values({
      question: interaction.options.getString("question"),
      author: interaction.user.id,
    })
    .onConflictDoNothing()

  if (result.affectedRows) {
    await interaction.reply({
      content: "✅ Your daily question has been submitted!",
      flags: MessageFlags.Ephemeral,
    })
  } else {
    await interaction.reply({
      content: "❌ You have already submitted this question",
      flags: MessageFlags.Ephemeral,
    })
  }
}

async function get(interaction: ChatInputCommandInteraction) {
  const rows = await db
    .select()
    .from(dailyQuestions)
    .where(eq(dailyQuestions.i, 0))

  if (rows.at(0)) {
    return interaction.reply(rows.at(0).question)
  } else {
    return interaction.reply("❌ There is no daily question today")
  }
}
