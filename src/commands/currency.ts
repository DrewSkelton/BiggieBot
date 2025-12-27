import {
  APIEmbed,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import { db } from "../database.js"
import { and, eq, isNull, or } from "drizzle-orm"
import { currencySettings, userBalances } from "../schema/currency.js"
import { addCurrency } from "../util/currency.js"

export const command = new SlashCommandBuilder()
  .setName("currency")
  .setDescription("Manages currency.")
  .addSubcommand((balance) =>
    balance
      .setName("balance")
      .setDescription("View your balance.")
      .addBooleanOption((option) =>
        option
          .setName("ephemeral")
          .setDescription("Make your message invisible to others."),
      ),
  )
  .addSubcommand((modify) =>
    modify
      .setName("modify")
      .setDescription("Modify a user's currency.")
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("The amount to modify.")
          .setRequired(true),
      )
      .addUserOption((option) =>
        option.setName("user").setDescription("The user to modify."),
      )
      .addBooleanOption((option) =>
        option
          .setName("set")
          .setDescription("Sets balance to 0 before modifying."),
      ),
  )
  .addSubcommand((give) =>
    give
      .setName("give")
      .setDescription("Give currency to another user.")
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("The amount to give.")
          .setMinValue(1)
          .setRequired(true),
      )
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to give to.")
          .setRequired(true),
      ),
  )
  .addSubcommand((reset) =>
    reset.setName("reset").setDescription("Reset everyone's balance."),
  )
  .addSubcommand((settings) =>
    settings
      .setName("settings")
      .setDescription("Set the currency for the server.")
      .addBooleanOption((option) =>
        option
          .setName("enabled")
          .setDescription("Enables or disables currency in the server."),
      )
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The singular name of the currency."),
      )
      .addStringOption((option) =>
        option
          .setName("plural_name")
          .setDescription("The plural name of the currency."),
      )
      .addStringOption((option) =>
        option
          .setName("icon")
          .setDescription("The icon of the currency (usually an emoji)."),
      ),
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case "balance":
      return balance(interaction)
    case "give":
      return give(interaction)
    case "modify":
      return modify(interaction)
    case "reset":
      return reset(interaction)
    case "settings":
      return settings(interaction)
  }
}

async function balance(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.options.getBoolean("ephemeral")

  const currencySettingsList = await db
    .select()
    .from(currencySettings)
    .where(
      eq(currencySettings.guild, interaction.guild?.id || interaction.user.id),
    )

  if (currencySettingsList.length == 0) {
    await interaction.reply({
      embeds: [
        {
          color: 0xff0000,
          title: "Error",
          description: "Currency is not enabled in this server.",
        },
      ],
      flags: MessageFlags.Ephemeral,
    })
    return
  }

  const settings = currencySettingsList.at(0)!

  const balance = await db
    .select()
    .from(userBalances)
    .where(
      and(
        interaction.guild
          ? eq(userBalances.guild, interaction.guild.id)
          : isNull(userBalances.guild),
        eq(userBalances.user, interaction.user.id),
      ),
    )
  await interaction.reply({
    embeds: [
      {
        title: `Balance`,
        description: `${settings.icon}${balance.at(0)?.balance || 0}`,
      },
    ],
    flags: ephemeral ? MessageFlags.Ephemeral : undefined,
  })
}

async function give(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("amount")!
  const user = interaction.options.getUser("user")!

  const embeds: APIEmbed[] = []

  const senderResult = await addCurrency(
    amount * -1,
    interaction.user,
    interaction.guild,
  )
  embeds.push(senderResult.embed)

  if (senderResult.success) {
    const receiverResult = await addCurrency(amount, user, interaction.guild)
    embeds.push(receiverResult.embed)
  }

  await interaction.reply({
    embeds: embeds,
  })
}

async function modify(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("amount")!
  const user = interaction.options.getUser("user")
  const set = interaction.options.getBoolean("set")

  // Check for manage server permission
  if (
    interaction.guild &&
    !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
  ) {
    await interaction.reply({
      embeds: [
        {
          color: 0xff0000,
          title: "Error",
          description: "You do not have permission to manage server.",
        },
      ],
      flags: MessageFlags.Ephemeral,
    })
    return
  }

  if (set) {
    await addCurrency(0, user || interaction.user, interaction.guild)
  }

  const currencyResult = await addCurrency(
    amount,
    user || interaction.user,
    interaction.guild,
  )

  await interaction.reply({ embeds: [currencyResult.embed] })
}

async function reset(interaction: ChatInputCommandInteraction) {
  // Check for manage server permission
  if (
    interaction.guild &&
    !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
  ) {
    await interaction.reply({
      embeds: [
        {
          color: 0xff0000,
          title: "Error",
          description: "You do not have permission to manage server.",
        },
      ],
      flags: MessageFlags.Ephemeral,
    })
    return
  }

  await db
    .delete(userBalances)
    .where(
      interaction.guild
        ? eq(userBalances.guild, interaction.guild.id)
        : and(
            isNull(userBalances.guild),
            eq(userBalances.user, interaction.user.id),
          ),
    )

  await interaction.reply({
    embeds: [
      {
        color: 0x00ff00,
        title: "Success",
        description: "Server balances deleted!",
      },
    ],
  })
}

// Sets every value of currency settings while also allowing creation and deletion in the case of enabling or disabling
// Unspecified values remain as default
// This function is very awful as of now, it likely will need a rewrite later
async function settings(interaction: ChatInputCommandInteraction) {
  const enabled = interaction.options.getBoolean("enabled")
  const name = interaction.options.getString("name")
  const plural_name = interaction.options.getString("plural_name")
  const icon = interaction.options.getString("icon")

  // Check for manage server permission
  if (
    interaction.guild &&
    !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
  ) {
    await interaction.reply({
      embeds: [
        {
          color: 0xff0000,
          title: "Error",
          description: "You do not have permission to manage server.",
        },
      ],
      flags: MessageFlags.Ephemeral,
    })
    return
  }

  // Enabling and disabling is simply creating or removing the currency settings table
  // If enabled is specified as false, then every other option should be ignored.
  // Disable
  if (enabled === false) {
    const result = await db
      .delete(currencySettings)
      .where(
        eq(
          currencySettings.guild,
          interaction.guild?.id || interaction.user.id,
        ),
      )
    if (result.rowsAffected == 0) {
      await interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: "Error",
            description: "Currency is already disabled.",
          },
        ],
      })
    } else {
      await interaction.reply({
        embeds: [
          {
            color: 0x00ff00,
            title: "Success",
            description: "Currency has been disabled!",
          },
        ],
      })
    }
  } else if (enabled === true) {
    // Enable
    const result = await db
      .insert(currencySettings)
      .values({
        guild: interaction.guild?.id || interaction.user.id,
        name: name || undefined,
        name_plural: plural_name || undefined,
        icon: icon || undefined,
      })
      .onConflictDoNothing()
    if (result.rowsAffected == 0) {
      await interaction.reply({
        embeds: [
          {
            color: 0xff0000,
            title: "Error",
            description: "Currency is already enabled.",
          },
        ],
      })
    } else {
      await interaction.reply({
        embeds: [
          {
            color: 0x00ff00,
            title: "Success",
            description: "Currency has been enabled!",
          },
        ],
      })
    }
  } else {
    try {
      // Modify/view settings
      const settings = await db
        .update(currencySettings)
        .set({
          name: name || undefined,
          name_plural: plural_name || undefined,
          icon: icon || undefined,
        })
        .where(
          eq(
            currencySettings.guild,
            interaction.guild?.id || interaction.user.id,
          ),
        )
        .returning()
      if (settings.length == 0) {
        await interaction.reply({
          embeds: [
            {
              color: 0xff0000,
              title: "Error",
              description: "Currency is not enabled.",
            },
          ],
        })
      } else {
        await interaction.reply({
          embeds: [
            {
              color: 0x00ff00,
              title: "Success",
              fields: [
                {
                  name: "Name",
                  value: settings.at(0)?.name || "N/A",
                },
                {
                  name: "Plural Name",
                  value: settings.at(0)?.name_plural || "N/A",
                },
                {
                  name: "Icon",
                  value: settings.at(0)?.icon || "N/A",
                },
              ],
            },
          ],
        })
      }
    } catch {
      const settings = await db
        .select()
        .from(currencySettings)
        .where(
          eq(
            currencySettings.guild,
            interaction.guild?.id || interaction.user.id,
          ),
        )
      await interaction.reply({
        embeds: [
          {
            color: 0x0000ff,
            title: "Info",
            fields: [
              {
                name: "Enabled",
                value: String(settings.length > 0),
              },
              {
                name: "Name",
                value: settings.at(0)?.name || "N/A",
              },
              {
                name: "Plural Name",
                value: settings.at(0)?.name_plural || "N/A",
              },
              {
                name: "Icon",
                value: settings.at(0)?.icon || "N/A",
              },
            ],
          },
        ],
      })
    }
  }
}
