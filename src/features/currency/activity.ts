import { Events, Message } from "discord.js"
import { addCurrency } from "./util.js"
import { Event } from "../../shared.js"

// Adds money to users who are active with messages

const COOL_DOWN = 1000 * 60 * 5 // 5 Minutes
const coolDowns = new Map<string, number>() // Hashmap of the user + guild to time in milliseconds (Date.now())

export default new Event(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return

  const key = message.author.id + (message.guild?.id || "")
  const lastRewarded = coolDowns.get(key)

  if (lastRewarded == undefined || Date.now() - lastRewarded > COOL_DOWN) {
    await addCurrency(1, message.author, message.guild)
    coolDowns.set(key, Date.now())
  }
})
