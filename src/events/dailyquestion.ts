import { Client, Events, TextChannel } from "discord.js"
import cron from "node-cron"
import { db } from "../database.js"
import {
  dailyQuestionChannels,
  dailyQuestions,
} from "../schema/dailyquestions.js"
import { eq, min } from "drizzle-orm"

export const once = Events.ClientReady

export async function execute(client: Client) {
  // Schedule a daily question at 9 AM
  cron.schedule("0 9 * * *", () => {
    askDailyQuestion(client)
  })
}

async function askDailyQuestion(client: Client) {
  // The current daily question is the one at i 0
  await db.delete(dailyQuestions).where(eq(dailyQuestions.i, 0))

  // Set the daily question with the hightest i value (most recent) to zero, making it the current daily question
  const rows = await db
    .update(dailyQuestions)
    .set({ i: 0 })
    .where(
      eq(
        dailyQuestions.i,
        db.select({ min: min(dailyQuestions.i) }).from(dailyQuestions)
      )
    )
    .returning()

  const question = rows.at(0)

  if (!question) return

  const channels = await db.select().from(dailyQuestionChannels)

  for (const channelRow of channels) {
    // Get the channel to post in
    const channel = client.channels.cache.get(channelRow.channel) as TextChannel

    if (channel) await channel.send(`**Daily Question:** ${question.question}`)
  }
}
