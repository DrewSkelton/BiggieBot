import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const command = new SlashCommandBuilder()
    .setName('freefood')
    .setDescription('Lists all free food events on OU campus')

export async function execute(interaction: ChatInputCommandInteraction) {
    //Can either be an image URL or a text description as a fallback
    let eventLinks = await fetchEngage()

    if (eventLinks.length === 0) {
        await interaction.reply('Could not find any free food :cry:');
        return;
    }

    let reply = 'Found free food!\n'

    for (const link of eventLinks) {
        reply += link + '\n'
    }

    await interaction.reply(reply);
}

async function fetchEngage(days_ahead = 0) {
    let now = new Date()
    
    //Round to the nearest next day
    let dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate()+days_ahead+1)

    let eventLinks = []
    try {
        const response = await fetch(`https://ou.campuslabs.com/engage/api/discovery/event/search?endsAfter=${now.toISOString()}&startsBefore=${dateTo.toISOString()}`)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let json: any = await response.json()

        for (const event of json.value) {
            if (event.benefitNames.includes('Free Food') || stringContainsFood(event.description)) {
                eventLinks.push('https://ou.campuslabs.com/engage/event/' + event.id)
            }
        }

    } catch (error) {
        console.error(error.message)
    }

    return eventLinks    
}

function stringContainsFood(str) {
    const keywords = ["food", "snack", "pizza"]
    for (const keyword of keywords) {
        if (str.includes(keyword)) return true
    }
    return false
}
