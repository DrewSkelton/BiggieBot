import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

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

  const eventLinks = await fetchEngage(
    interaction.options.getInteger("days_ahead") || 0,
  )

  if (eventLinks.length === 0) {
    await interaction.followUp("Could not find any free food :cry:")
    return
  }

  let reply = ""
  for (const link of eventLinks) {
    reply += link + "\n"
  }

  await interaction.followUp(reply)
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

  console.log(dateTo)

  const eventLinks: string[] = []

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
      console.log(json)

      rightDate.setDate(rightDate.getDate() + 1)
      leftDate.setDate(leftDate.getDate() + 1)
    }

    console.log(
      `https://ou.campuslabs.com/engage/api/discovery/event/search?endsAfter=${leftDate.toISOString()}&startsBefore=${dateTo.toISOString()}`,
    )

    for (const json of responses) {
      for (const event of json.value) {
        if (
          event.benefitNames.includes("Free Food") ||
          stringContainsFood(event.description)
        ) {
          const today = new Date().getDate()
          const tomorrow = new Date().getDate() + 1
          const eventDate = new Date(event.startsOn).getDate()
          const formattedDate =
            eventDate === today
              ? "Today"
              : eventDate === tomorrow
                ? "Tomorrow"
                : new Date(event.startsOn).toLocaleDateString(undefined, {
                    weekday: "long",
                  })
          eventLinks.push(
            `## [${event.name}](https://ou.campuslabs.com/engage/event/${event.id})\n` +
              //Discord date formatters use seconds instead of milliseconds
              `${formattedDate}, <t:${Math.floor(Date.parse(event.startsOn) / 1000)}:t>-<t:${Math.floor(Date.parse(event.endsOn) / 1000)}:t> at **${event.location}**`,
          )
        }
      }
    }
  } catch (error) {
    console.error(error)
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
