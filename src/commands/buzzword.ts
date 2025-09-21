import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import { db } from "../database.js"
import { and, eq } from "drizzle-orm"
import { buzzwords } from "../schema/buzzwords.js"

const permission = PermissionFlagsBits.ManageGuild
const limit = 5

export const command = new SlashCommandBuilder()
  .setName("buzzword")
  .setDescription("Manages buzzwords")
  .addSubcommand((add) =>
    add
      .setName("add")
      .setDescription(
        `Adds a new buzzword and response (limit: ${limit} per user).`,
      )
      .addStringOption((option) =>
        option
          .setName("buzzword")
          .setDescription("The phrase to listen for.")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("response")
          .setDescription("What to respond with.")
          .setRequired(true),
      ),
  )
  .addSubcommand((remove) =>
    remove
      .setName("remove")
      .setDescription("Removes a buzzword you've created.")
      .addStringOption((option) =>
        option
          .setName("buzzword")
          .setDescription("The buzzword to remove.")
          .setRequired(true),
      ),
  )
  .addSubcommand((list) =>
    list
      .setName("list")
      .setDescription("Lists all buzzwords and their responses."),
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case "add":
      return add(interaction)
    case "remove":
      return remove(interaction)
    case "list":
      return list(interaction)
  }
}

async function add(interaction: ChatInputCommandInteraction) {
  if (
    !interaction.memberPermissions.has(permission) &&
    (await getBuzzwordCount(interaction)) >= limit
  ) {
    return interaction.reply(`❌ You can only add up to ${limit} buzzwords.`)
  }

  const buzzword = interaction.options.getString("buzzword").toLowerCase()
  const response = interaction.options.getString("response")

  await db.insert(buzzwords).values({
    guild: interaction.guild.id,
    trigger: buzzword,
    response: response,
    owner: interaction.user.id,
  })

  await interaction.reply(
    `✅ Added buzzword "${buzzword}" with response: "${response}".`,
  )
}

async function remove(interaction: ChatInputCommandInteraction) {
  const buzzword = interaction.options.getString("buzzword").toLowerCase()

  const result = await db
    .delete(buzzwords)
    .where(
      and(
        eq(buzzwords.guild, interaction.guild.id),
        eq(buzzwords.trigger, buzzword),
      ),
    )

  if (result.affectedRows)
    await interaction.reply(`✅ Removed buzzword "${buzzword}".`)
  else
    await interaction.reply(
      "❌ Could not find a buzzword owned by you which matches",
    )
}

async function list(interaction: ChatInputCommandInteraction) {
  const rows = await db
    .select()
    .from(buzzwords)
    .where(eq(buzzwords.guild, interaction.guild.id))

  let reply = ""
  let userBuzzwordCount = 0

  for (const row of rows) {
    const isOwner = row.owner === interaction.user.id
    if (isOwner) userBuzzwordCount++
    reply += `- **${row.trigger}**: ${row.response}${isOwner ? " (yours)" : ""}\n`
  }

  // Add note about limits
  reply += "\n"
  if (interaction.memberPermissions.has(permission)) {
    reply += `You have created ${userBuzzwordCount} buzzwords`
  } else {
    reply += `You have created ${userBuzzwordCount}/${limit} buzzwords.`
  }

  await interaction.reply(reply)
}

async function getBuzzwordCount(
  interaction: ChatInputCommandInteraction,
): Promise<number> {
  const result = await db
    .select({})
    .from(buzzwords)
    .where(
      and(
        eq(buzzwords.guild, interaction.guild.id),
        eq(buzzwords.owner, interaction.user.id),
      ),
    )
  return result.length
}
