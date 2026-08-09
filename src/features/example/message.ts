import { Events, Message } from "discord.js"
import { Event } from "../../shared.js"

// Events are registered similarly in two parts:
// 1. The event type
// 2. The function to run when a message is sent
// !!BE SURE TO IMPORT THE "Event" CLASS FROM "shared.js"!!
// See https://discordjs.guide/legacy/app-creation/handling-events
export default new Event(
  Events.MessageCreate,

  async (message: Message) => {
    if (!message.author.bot && message.content == "Ping!") {
      await message.reply("Pong")
    }
  },
)
