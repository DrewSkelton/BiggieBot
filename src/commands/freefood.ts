import {
  APIEmbed,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js"

export const command = new SlashCommandBuilder()
  .setName("freefood")
  .setDescription("Lists all free food events on OU campus.")

  .addIntegerOption((option: any) =>
    option
      .setName("days_ahead")
      .setDescription("The number of days ahead to look for free food.")
      .setRequired(false),
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()

  const embeds: APIEmbed[] = await fetchEngage(
    interaction.options.getInteger("days_ahead") || 0,
  )

  if (embeds.length === 0) {
    const embed: APIEmbed = {
      title: ":x: Could not find any free food events",
    }
    await interaction.followUp({ embeds: [embed] })
    return
  }

  await interaction.followUp({ embeds: embeds })
}

async function fetchEngage(days_ahead: number) {
  const now = new Date()

  const leftDate = new Date()

  let rightDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  //Round to the nearest next day
  const dateTo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + days_ahead + 1,
  )

  const embeds: APIEmbed[] = []

  try {
    const responses = []
    while (rightDate <= dateTo) {
      const response = await fetch(
        `https://ou.campuslabs.com/engage/api/discovery/event/search?endsAfter=${leftDate.toISOString()}&startsBefore=${rightDate.toISOString()}`,
      )

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const json: any = await response.json()
      responses.push(json)

      rightDate.setDate(rightDate.getDate() + 1)
      leftDate.setDate(leftDate.getDate() + 1)
    }

    for (const json of responses) {
      for (const event of json.value) {
        if (
          event.benefitNames.includes("Free Food") ||
          stringContainsFood(event.description)
        ) {
          // Create the fancy message
          const embed: APIEmbed = {
            title: event.name,
            url: `https://ou.campuslabs.com/engage/event/${event.id}`,
            thumbnail: {
              url: `https://se-images.campuslabs.com/clink/images/${event.imagePath || event.organizationProfilePicture}`,
            },
            fields: [
              {
                name: "Time",
                value: `<t:${Math.floor(Date.parse(event.startsOn) / 1000)}:t>-<t:${Math.floor(Date.parse(event.endsOn) / 1000)}:t> (<t:${Math.floor(Date.parse(event.startsOn) / 1000)}:R>)`,
              },
              { name: "Location", value: event.location },
            ],
          }
          embeds.push(embed)
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
  return embeds
}

function stringContainsFood(str: string): boolean {
  const keywords = ["food", "snack", "pizza"]
  for (const keyword of keywords) {
    if (str.includes(keyword)) return true
  }
  return false
}
