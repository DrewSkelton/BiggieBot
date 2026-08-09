import { Events, Message } from "discord.js"
import { buzzwords } from "./schema.js"
import { eq } from "drizzle-orm"
import { db, Event } from "../../shared.js"

export default new Event(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return

  const rows = await db
    .select()
    .from(buzzwords)
    .where(eq(buzzwords.guild, message.guild!.id))
  if (!rows) return

  for (const buzzword of rows) {
    if (buzzword.regex && message.content.match(buzzword.trigger)) {
      await message.reply(buzzword.response)
    } else if (message.content.toLowerCase().includes(buzzword.trigger)) {
      await message.reply(buzzword.response)
    }
  }
})
