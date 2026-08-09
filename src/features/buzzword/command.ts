import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import { db, SlashCommand } from "../../shared.js"
import { and, eq } from "drizzle-orm"
import { buzzwords } from "./schema.js"

const permission = PermissionFlagsBits.ManageGuild
const limit = 5

export default new SlashCommand(
  new SlashCommandBuilder()
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
        )
        .addBooleanOption((option) =>
          option
            .setName("regex")
            .setDescription(
              "Match a regular expression instead of a substring.",
            )
            .setRequired(false),
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
    ),

  async (interaction: ChatInputCommandInteraction) => {
    switch (interaction.options.getSubcommand()) {
      case "add":
        await add(interaction)
        break
      case "remove":
        await remove(interaction)
        break
      case "list":
        await list(interaction)
        break
    }
  },
)

async function add(interaction: ChatInputCommandInteraction) {
  if (
    !interaction.memberPermissions?.has(permission) &&
    (await getBuzzwordCount(interaction)) >= limit
  ) {
    await interaction.reply(`❌ You can only add up to ${limit} buzzwords.`)
    return
  }

  const buzzword = interaction.options.getString("buzzword")?.toLowerCase()!
  const response = interaction.options.getString("response")!
  const regex = interaction.options.getBoolean("regex", false)

  // Check if the buzzword is valid Regex
  if (regex) {
    try {
      new RegExp(buzzword)
    } catch (error) {
      if (error instanceof SyntaxError) {
        await interaction.reply(error.message)
        return
      } else {
        throw error
      }
    }
  }

  await db.insert(buzzwords).values({
    guild: interaction.guild!.id,
    trigger: buzzword,
    response: response,
    owner: interaction.user.id,
    regex: Number(regex)
  })

  await interaction.reply(
    `Added buzzword "${buzzword}" with response: "${response}".`,
  )
}

async function remove(interaction: ChatInputCommandInteraction) {
  const buzzword = interaction.options.getString("buzzword")?.toLowerCase()

  const result = await db
    .delete(buzzwords)
    .where(
      and(
        eq(buzzwords.guild, interaction.guild!.id),
        eq(buzzwords.trigger, buzzword!),
      ),
    )

  if (result.rowsAffected)
    await interaction.reply(`Removed buzzword "${buzzword}".`)
  else
    await interaction.reply(
      "❌ Could not find a buzzword owned by you which matches",
    )
}

async function list(interaction: ChatInputCommandInteraction) {
  const rows = await db
    .select()
    .from(buzzwords)
    .where(eq(buzzwords.guild, interaction.guild!.id))

  let reply = ""
  let userBuzzwordCount = 0

  for (const row of rows) {
    const isOwner = row.owner === interaction.user.id
    if (isOwner) userBuzzwordCount++
    reply += `- **${row.trigger}**: ${row.response}${isOwner ? " (yours)" : ""}\n`
  }

  // Add note about limits
  reply += "\n"
  if (interaction.memberPermissions!.has(permission)) {
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
        eq(buzzwords.guild, interaction.guild!.id),
        eq(buzzwords.owner, interaction.user.id),
      ),
    )
  return result.length
}
