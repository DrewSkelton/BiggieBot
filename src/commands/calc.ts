import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { create, all, format} from "mathjs";

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
            evaluate(interaction.options.getString('expression'))
        );
    }
    catch(error) {
        await interaction.reply(`\`${error}\``)
    }
    
}

// Expression parser security
const math = create(all)

math.import({
  import: function () { throw new Error('Function import is disabled') },
  createUnit: function () { throw new Error('Function createUnit is disabled') },
  evaluate: function () { throw new Error('Function evaluate is disabled') },
  parse: function () { throw new Error('Function parse is disabled') },
  simplify: function () { throw new Error('Function simplify is disabled') },
  derivative: function () { throw new Error('Function derivative is disabled') }
}, { override: true })

export function evaluate(expression: string): string {
    return format(math.evaluate(expression), 14);
}