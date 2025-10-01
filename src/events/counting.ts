import { Events, Message, TextChannel } from "discord.js"
import { evaluate, unequal } from "mathjs/number"
import { db } from "../database.js"
import { countingChannels } from "../schema/counting.js"
import { and, eq, lt } from "drizzle-orm"

export const on = Events.MessageCreate

export async function execute(message: Message) {
  if (message.author.bot) return

  const row = (
    await db
      .select()
      .from(countingChannels)
      .where(eq(countingChannels.channel, message.channel.id))
  ).at(0)

  if (!row) return

  // Get the content of the message
  const content = message.content.trim().replaceAll("`", "")

  // Try to interpret the content as a number, Roman numeral, or math expression
  let number: number | undefined

  // Try to parse as a Roman numeral
  if (/^[IVXLCDM]+$/.test(content)) {
    number = parseRomanNumeral(content)
  } else
    try {
      number = evaluate(content)
    } catch {
      /* empty */
    }

  // If we couldn't parse as any valid format, don't react
  if (number == undefined) {
    return
  }

  // Check if the number is the next in sequence
  if (unequal(number, row.count! + 1)) {
    // Reset the count before sending the message
    await db
      .update(countingChannels)
      .set({ count: 0, last: "" })
      .where(eq(countingChannels.channel, message.channel.id))

    await message.reply(
      `Counting failed at **${row.count! + 1}**! **${number}** is the wrong number! The count has been reset.`,
    )
    await (message.channel as TextChannel).send(
      `<@${message.author.id}> ruined it for everyone!`,
    )
    await message.react("❌")
  }

  // Check if the same user is trying to count twice in a row
  else if (message.author.id === row.last) {
    // Reset the count before sending the message
    await db
      .update(countingChannels)
      .set({ count: 0, last: "" })
      .where(eq(countingChannels.channel, message.channel.id))

    await message.react("❌")
    await message.reply(
      `Counting failed at **${row.count! + 1}**! You can't count twice in a row! The count has been reset.`,
    )
    await (message.channel as TextChannel).send(
      `<@${message.author.id}> ruined it for everyone!`,
    )
  }

  // Update the current count to the new count
  else {
    await db
      .update(countingChannels)
      .set({ count: row.count! + 1, last: message.author.id })
      .where(eq(countingChannels.channel, message.channel.id))
    // Probably a way to set the highest count a little easier (maybe a subquery)
    await db
      .update(countingChannels)
      .set({ highest: row.count! + 1 })
      .where(
        and(
          eq(countingChannels.channel, message.channel.id),
          lt(countingChannels.highest, row.count! + 1),
        ),
      )
    await message.react("✅")
  }
}

// Parse Roman numeral to integer
function parseRomanNumeral(str: string): number {
  const romanStr = str.toUpperCase()
  const romanMap: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }

  let result = 0
  let i = 0

  while (i < romanStr.length) {
    // Get current and next values
    const current = romanMap[romanStr[i]]
    const next = i + 1 < romanStr.length ? romanMap[romanStr[i + 1]] : 0

    // If current is greater than or equal to next, add current
    if (current >= next) {
      result += current
      i++
    }
    // If current is less than next, subtract current from next and add
    else {
      result += next - current
      i += 2
    }
  }

  return result
}
