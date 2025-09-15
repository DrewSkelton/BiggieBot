import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
    .setName('oracle')
    .setDescription("A port of the Oracle program from TempleOS.")
    .addIntegerOption(option => option
        .setName('words')
        .setDescription('The number of words to generate. Leave empty for a random amount.')
        .setMinValue(1)
    )

let dictionary: string[]
export async function execute(interaction: ChatInputCommandInteraction) {
    // I'm lazy and don't want to store TempleOS's dictionary in the bot
    if (!dictionary) {
        const response = await fetch('https://raw.githubusercontent.com/Xe/TempleOS/1dd8859b7803355f41d75222d01ed42d5dda057f/Adam/God/Vocab.DD')
        dictionary = (await response.text()).split('\n')
    }
    
    let words = interaction.options.getInteger('words')

    let reply = `**He says:** `

    for (let i = 0; !words || i < words && reply.length < 2000; i++) {
        reply += dictionary[Math.floor(Math.random() * dictionary.length)] + ' '
        // If no words are specified, then there will be a 5% chance to end the loop, resulting in a logarithmic distribution of random words
        if (!words && Math.random() < 0.05) break
    }

    await interaction.reply(reply)

}