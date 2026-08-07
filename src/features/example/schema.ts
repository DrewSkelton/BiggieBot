import { integer, sqliteTable } from "drizzle-orm/sqlite-core"
import { db, SlashCommand } from "../../shared.js"
import { SlashCommandBuilder } from "discord.js"

// Unlike Slash Commands and Events, the name of the database table WILL matter if you plan on importing it in other files.
// Also unlike Slash Commands and Events, schemas must live somewhere in the 'features' folder
// !!BE SURE TO RUN `npm run migrate` WHEN MAKING ANY DATABASE CHANGES!!
// See https://orm.drizzle.team/docs/guides
export const incrementTable = sqliteTable("increment", {
  i: integer().notNull().default(0),
})

// Example command to interact with the database.
export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("increment")
    .setDescription("Increment a global counter."),

  async (interaction) => {
    // Select all tables from the ping table
    let results = await db.select().from(incrementTable)

    // If the query returned a result...
    if (results.at(0)) {
      // Store the count + 1
      let count = results.at(0)!.i + 1

      // Reply to the user
      await interaction.reply(count.toString())

      // Update the table to the new value
      await db.update(incrementTable).set({
        i: count,
      })
    }
    // If the query returned 0 results..
    else {
      // Reply to the user
      await interaction.reply("1")

      // Create a new table
      await db.insert(incrementTable).values({ i: 1 })
    }
  },
)
