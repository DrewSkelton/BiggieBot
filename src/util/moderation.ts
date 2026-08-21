import { Guild, User } from "discord.js"

/// Returns true if the user was successfully kicked
export async function kickAndDeleteRecentMessages(
  user: User,
  guild: Guild,
): Promise<boolean> {
  try {
    await guild.members.kick(user)
    // The rest of the block will not execute if the user was not kicked

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

    await user.send(
      `You have been kicked from **${guild.name}** for suspected bot activity.`,
    )

    return true
  } catch {
    return false
  }
}
