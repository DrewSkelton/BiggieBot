import { Events, Message, TextChannel } from "discord.js"
import { db } from "../database.js"
import { countingChannels } from "../schema/counting.js"
import { eq } from "drizzle-orm"

export const on = Events.MessageDelete

export async function execute(message: Message) {
  if (message.author.bot) return

  const row = (
    await db
      .select()
      .from(countingChannels)
      .where(eq(countingChannels.channel, message.channel.id))
  ).at(0)

  if (!row) return

  // Check for a check mark reaction from the current client (bot)
  if (
    message.reactions.cache.get("✅")?.users.cache.get(message.client.user.id)
  ) {
    await (message.channel as TextChannel).send(
      `:rotating_light: ${message.author} has deleted their message! The current count is **${row.count}**! :rotating_light:`,
    )
  }
}
