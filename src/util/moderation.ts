import { Guild, User } from "discord.js"

export async function kickAndDeleteRecentMessages(user: User, guild: Guild) {
  try {
    await guild.members.kick(user)
  } catch {}
  for (const channel of guild.channels.cache) {
    if (channel[1].isTextBased()) {
      for (const message of channel[1].messages.cache) {
        if (
          message[1].author == user &&
          Date.now() - message[1].createdAt.getTime() < 1000 * 60 // 1 minute
        ) {
          await message[1].delete()
        }
      }
    }
  }
}
