import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { PlayingCardDeck } from "../util/cards.js"
import { SlashCommand } from "../shared.js"

const decks = new Map<string, PlayingCardDeck>()

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("card")
    .setDescription("Play with cards.")
    .addSubcommand((draw) =>
      draw
        .setName("draw")
        .setDescription("Draw a card.")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of cards to draw")
            .setMinValue(1)
            .setMaxValue(52),
        ),
    )
    .addSubcommand((shuffle) =>
      shuffle.setName("shuffle").setDescription("Create a new deck"),
    ),
  async (interaction: ChatInputCommandInteraction) => {
    switch (interaction.options.getSubcommand()) {
      case "draw":
        await draw(interaction)
      case "shuffle":
        await shuffle(interaction)
    }
  }
)

async function draw(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("amount") || 1

  const deck = decks.get(interaction.channel?.id || interaction.user.id)
  if (!deck) {
    await interaction.reply({
      embeds: [
        {
          color: 0xff0000,
          title: "Error",
          description:
            "No deck has been created. Run /card shuffle and try again.",
        },
      ],
    })
    return
  } else if (deck.length == 0) {
    await interaction.reply({
      embeds: [
        {
          color: 0xff0000,
          title: "Error",
          description:
            "The deck is empty. Run /card shuffle to make a new deck.",
        },
      ],
    })
    return
  }

  let card_strings = ""
  for (let i = 0; i < amount && deck.length > 0; i++) {
    card_strings += deck.pop().string() + "\n"
  }

  await interaction.reply({
    embeds: [
      {
        title: "Cards",
        description: card_strings,
      },
    ],
  })
}

async function shuffle(interaction: ChatInputCommandInteraction) {
  decks.set(
    interaction.channel?.id || interaction.user.id,
    new PlayingCardDeck(),
  )
  await interaction.reply({
    embeds: [
      {
        description: "Deck shuffled.",
      },
    ],
  })
}
