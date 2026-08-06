import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { evaluate, format } from "mathjs/number"
import { parseStringToExpression } from "../util/math.js"

export const command = new SlashCommandBuilder()
  .setName("calc")
  .setDescription("Calc is short for calculator.")
  .addStringOption((option) =>
    option
      .setName("expression")
      .setDescription("The expression to evaluate.")
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName("ephemeral")
      .setDescription("Make your message invisible to others."),
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const expression = parseStringToExpression(
    interaction.options.getString("expression")!,
  ).toLowerCase()
  try {
    await interaction.reply({
      // Default precision is 16. We set the precision to 14 to hide precision errors from expressions like 0.1 + 0.2.
      // But when precision is set and notation is set to 'fixed', then the number is padded to fit the precision so
      // 1 would become 1.00000000000000, which is why we use the auto notation with infinite exponent bounds.
      content: format(evaluate(expression), {
        precision: 14,
        lowerExp: -Infinity,
        upperExp: Infinity,
      }),
      flags: interaction.options.getBoolean("ephemeral")
        ? MessageFlags.Ephemeral
        : undefined,
    })
  } catch (error) {
    await interaction.reply(`\`${error}\``)
  }
}
