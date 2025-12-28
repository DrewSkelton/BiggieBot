import { Guild, User } from "discord.js"
import type { APIEmbed } from "discord.js"
import { db } from "../database.js"
import { currencySettings, userBalances } from "../schema/currency.js"
import { eq, sql } from "drizzle-orm"

// Adds or subtracts currency from a user
// Returns an object which indicates if the operation was successful
// and an embed which can optionally be used as a reply.
export async function addCurrency(
  amount: number,
  user: User,
  guild: Guild | null,
): Promise<{ success: boolean; embed: APIEmbed }> {
  if (user.bot)
    return {
      success: false,
      embed: {
        color: 0xff0000,
        title: "Error",
        description: "Bots do not have a balance.",
      },
    }

  const currencySettingsList = await db
    .select()
    .from(currencySettings)
    .where(eq(currencySettings.guild, guild?.id || user.id))

  if (!currencySettingsList.length) {
    return {
      success: false,
      embed: {
        color: 0xff0000, // Red
        title: "Error",
        description: "Currency is not enabled in this server.",
      },
    }
  }
  const currency = currencySettingsList.at(0)!

  try {
    await db
      .insert(userBalances)
      .values({ guild: guild?.id, user: user.id, balance: amount })
      .onConflictDoUpdate({
        target: [userBalances.guild, userBalances.user],
        set: { balance: sql`${userBalances.balance} + ${amount}` },
      })
  } catch (error: any) {
    if (error.cause.code == "SQLITE_CONSTRAINT_CHECK")
      return {
        success: false,
        embed: {
          color: 0xff0000,
          title: "Error",
          description: `${user} does not have enough ${currency.name_plural || "currency"}.`,
        },
      }
    else throw error
  }

  // User has earned/lost $x dollar(s)
  return {
    success: true,
    embed: {
      color: amount >= 0 ? 0x00ff00 : 0xff0000, // Red on negative, green on positive or zero
      title: "Balance",
      description: `${user} has ${amount >= 0 ? "earned" : "lost"} ${currency.icon}${Math.abs(amount)} ${Math.abs(amount) == 1 ? currency.name : currency.name_plural}.`,
    },
  }
}
