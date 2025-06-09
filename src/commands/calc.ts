import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { evaluate, format} from "mathjs/number";

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
            format(evaluate(interaction.options.getString('expression')), 14)
        );
    }
    catch(error) {
        await interaction.reply(`\`${error}\``)
    }
    
}