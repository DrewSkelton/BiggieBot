enum PlayingCardRank {
  Ace,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
}

enum PlayingCardSuit {
  Clubs,
  Spades,
  Hearts,
  Diamonds,
}

export class PlayingCard {
  rank: PlayingCardRank
  suit: PlayingCardSuit

  constructor(rank: PlayingCardRank, suit: PlayingCardSuit) {
    this.rank = rank
    this.suit = suit
  }
  string() {
    return `${PlayingCardRank[this.rank]} of ${PlayingCardSuit[this.suit]}`
  }
  // Equal to
  eq(card: PlayingCard) {
    return this.rank == card.rank
  }
  // Not equal to
  ne(card: PlayingCard) {
    return this.rank != card.rank
  }
  // Less than
  lt(card: PlayingCard) {
    return this.rank < card.rank
  }
  // Less than or equal to
  le(card: PlayingCard) {
    return this.rank <= card.rank
  }
  // Greater than
  gt(card: PlayingCard) {
    return this.rank > card.rank
  }
  // Greater than or equal to
  ge(card: PlayingCard) {
    return this.rank >= card.rank
  }
}

export class PlayingCardDeck {
  private deck: PlayingCard[] = []

  constructor() {
    // I don't like enums
    const suits = Object.values(PlayingCardSuit).filter(
      (value): value is PlayingCardSuit => typeof value === "number",
    )

    const ranks = Object.values(PlayingCardRank).filter(
      (value): value is PlayingCardRank => typeof value === "number",
    )

    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push(new PlayingCard(rank, suit))
      }
    }
  }

  get length() {
    return this.deck.length
  }

  push(card: PlayingCard) {
    this.deck.push(card)
  }

  pop() {
    const i = Math.floor(Math.random() * this.deck.length)
    const card = this.deck[i]
    this.deck.splice(i, 1)
    return card
  }

  peek() {
    const i = Math.floor(Math.random() * this.deck.length)
    return this.deck[i]
  }
}
