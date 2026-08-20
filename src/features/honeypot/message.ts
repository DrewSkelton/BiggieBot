import { Events, Message } from "discord.js"
import { db, Event } from "../../shared.js"
import { honeypotTable } from "./schema.js"
import { eq } from "drizzle-orm"
import { kickAndDeleteRecentMessages } from "../../util/moderation.js"

export default new Event(
  Events.MessageCreate,

  async (message: Message) => {
    const rows = await db
      .select()
      .from(honeypotTable)
      .where(eq(honeypotTable.channel, message.channel.id))
    if (!message.author.bot && rows.length > 0 && message.guild) {
      await kickAndDeleteRecentMessages(message.author, message.guild)
    }
  },
)
