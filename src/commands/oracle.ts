import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
    .setName('oracle')
    .setDescription("Talk to God with Terry Davis's oracle.")
    .addIntegerOption(option => option
        .setName('words')
        .setDescription('The number of words to generate. Leave empty for a random amount.')
        .setMinValue(0)
    )

let dictionary: string[]
export async function execute(interaction: ChatInputCommandInteraction) {
    // I'm lazy and don't want to store TempleOS's dictionary in the bot
    if (!dictionary) {
        const response = await fetch('https://raw.githubusercontent.com/Xe/TempleOS/1dd8859b7803355f41d75222d01ed42d5dda057f/Adam/God/Vocab.DD')
        dictionary = (await response.text()).split('\n')
    }
    
    let words = interaction.options.getInteger('words')
    
    if (words <= 0) {
        // Discord's message limit is 2000 characters. Let's assume the average word length is 6 characters.
        words = Math.floor(Math.random() * 2000/6)
    }

    let reply = '**God says:** '

    for (let i = 0; i < words && reply.length <= 2000; i++) {
        reply += dictionary[Math.floor(Math.random() * dictionary.length)] + ' '
    }

    await interaction.reply(reply)

}