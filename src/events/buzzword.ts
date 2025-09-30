import { Events, Message } from "discord.js"
import { buzzwords } from "../schema/buzzwords.js"
import { eq } from "drizzle-orm"
import { db } from "../database.js"

export const on = Events.MessageCreate

export async function execute(message: Message) {
  if (message.author.bot) return

  const rows = await db
    .select()
    .from(buzzwords)
    .where(eq(buzzwords.guild, message.guild!.id))
  if (!rows) return

  for (const buzzword of rows) {
    if (message.content.toLowerCase().includes(buzzword.trigger)) {
      await message.reply(buzzword.response)
    }
  }
}
