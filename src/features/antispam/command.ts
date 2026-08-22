import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { db, SlashCommand } from "../../shared.js"
import { eq } from "drizzle-orm"
import { antiSpamTable } from "./schema.js"

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("antispam")
    .setDescription(
      "Kick users if they send the same message to different channels quickly.",
    )
    .addBooleanOption((option) =>
      option.setName("enable").setDescription("Enable or disable."),
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers + PermissionFlagsBits.ManageChannels,
    ),

  async (interaction) => {
    if (!interaction.guild) {
      await interaction.reply(":x: Not a valid server")
      return
    }

    if (interaction.options.getBoolean("enable")) {
      // Enable
      const result = await db
        .insert(antiSpamTable)
        .values({ guild: interaction.guild.id })
        .onConflictDoNothing()
      if (!result.rowsAffected) {
        await interaction.reply(
          ":x: This server already has the anti-spam feature enabled",
        )
      } else {
        await interaction.reply(":white_check_mark: Success!")
      }
    } else {
      // Disable
      const result = await db
        .delete(antiSpamTable)
        .where(eq(antiSpamTable.guild, interaction.guild.id))
      if (!result.rowsAffected) {
        await interaction.reply(
          ":x: This server does not have the anti-spam feature enabled",
        )
      } else {
        await interaction.reply(":white_check_mark: Success!")
      }
    }
  },
)
