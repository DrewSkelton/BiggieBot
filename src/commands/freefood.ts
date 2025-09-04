import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const command = new SlashCommandBuilder()
    .setName('freefood')
    .setDescription('Lists all free food events on OU campus.')

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()
    
    const eventLinks = await fetchEngage()

    if (eventLinks.length === 0) {
        await interaction.followUp('Could not find any free food :cry:');
        return;
    }

    let reply = ''
    for (const link of eventLinks) {
        reply += link + '\n'
    }

    await interaction.followUp(reply);
}

async function fetchEngage(days_ahead = 0) {
    const now = new Date()
    
    //Round to the nearest next day
    const dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate()+days_ahead+1)

    const eventLinks = []
    try {
        const response = await fetch(`https://ou.campuslabs.com/engage/api/discovery/event/search?endsAfter=${now.toISOString()}&startsBefore=${dateTo.toISOString()}`)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json: any = await response.json()

        for (const event of json.value) {
            if (event.benefitNames.includes('Free Food') || stringContainsFood(event.description)) {
                eventLinks.push(`[${event.name}](https://ou.campuslabs.com/engage/event/${event.id})`)
            }
        }

    } catch (error) {
        console.error(error.message)
    }

    return eventLinks    
}

function stringContainsFood(str: string): boolean {
    const keywords = ["food", "snack", "pizza"]
    for (const keyword of keywords) {
        if (str.includes(keyword)) return true
    }
    return false
}
