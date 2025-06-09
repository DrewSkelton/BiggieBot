import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as math from "mathjs";

export const command = new SlashCommandBuilder()
    .setName('calc')
    .setDescription('Calc is short for calculator')
    .addStringOption(option => option
        .setName('expression')
        .setDescription('Expression to evaluate')
        .setRequired(true)
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.reply(
            String(math.evaluate(interaction.options.getString('expression')))
        );
    }
    catch(error) {
        await interaction.reply(`\`${error}\``)
    }
    
}