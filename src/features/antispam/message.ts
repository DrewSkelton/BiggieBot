import { Events, Message } from "discord.js"
import { db, Event } from "../../shared.js"
import { eq } from "drizzle-orm"
import { kickAndDeleteRecentMessages } from "../../util/moderation.js"
import { antiSpamTable } from "./schema.js"

// The criteria for being flagged is:
//  When a message is sent, it checks the map for an identical message sent by the same person in the same server
//  It then checks how many different channels it has been sent to
//  If the last sent identical message was over a minute ago, then the channel count is cleared
//  If the number of unique channels the message has been sent to is over 3, then the user is kick and their messages are deleted

// For some reason, using an object as a key uses reference equality, which we construct the key as a string
// The key would take the following form:
// [message, user, guild] (as ID strings)
const previousMessageCache: Map<
  string,
  {
    channels: Set<string>
    createdTimestamp: number
  }
> = new Map()

export default new Event(
  Events.MessageCreate,

  async (message: Message) => {
    if (message.author.bot || !message.guild) {
      return
    }

    const rows = await db
      .select()
      .from(antiSpamTable)
      .where(eq(antiSpamTable.guild, message.guild.id))

    if (!rows) return

    const key = message.content + message.author.id + message.guild.id

    let previousMessages = previousMessageCache.get(key) || {
      channels: new Set(),
      createdTimestamp: message.createdTimestamp,
    }

    previousMessages.channels.add(message.channel.id)

    if (
      message.createdTimestamp - previousMessages.createdTimestamp >
      60 * 1000 // 1 Minute
    ) {
      previousMessages.channels.clear()
    }

    if (previousMessages.channels.size >= 3) {
      await kickAndDeleteRecentMessages(message.author, message.guild)
    }

    previousMessages.createdTimestamp = message.createdTimestamp
    previousMessageCache.set(key, previousMessages)
  },
)
