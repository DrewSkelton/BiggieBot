import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { db } from '../utils/database.js';
import { countingTable } from '../schema/counting.js';
import { eq } from 'drizzle-orm';

export const command = new SlashCommandBuilder()
  .setName('counting')
  .setDescription('Manages counting.')
  .addSubcommand(leaderboard => leaderboard
    .setName('leaderboard')
    .setDescription('Sends the server with the highest count.')
  )
  .addSubcommand(set => set
    .setName('set')
    .setDescription('Sets the current channel for counting.')
  )
  .addSubcommand(remove => remove
    .setName('remove')
    .setDescription('Removes the current channel from counting.')
    .addBooleanOption(option => option
      .setName('all')
      .setDescription('Removes every channel from counting.')
    )
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'leaderboard': return leaderboard(interaction);
    case 'set': return set(interaction);
    case 'remove': return remove(interaction);
  }
}

async function set(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.reply({
    content: '❌ You do not have permission to manage channels.',
    flags: MessageFlags.Ephemeral
  });


  const result = await db.insert(countingTable).values({ id: interaction.channel.id }).onConflictDoNothing()
  if (result.rowCount > 0)
    await interaction.reply('✅ This channel has been set as a counting channel! Start counting from 1.');
  else
    await interaction.reply('❌ This channel is already a counting channel.');
}

async function remove(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.reply({
    content: '❌ You do not have permission to manage channels.',
    flags: MessageFlags.Ephemeral
  });

  const result = await db.delete(countingTable).where(eq(countingTable.id, interaction.channel.id));
  if (result.rowCount > 0)
    await interaction.reply('✅ This channel has been removed as the counting channel!');
  else
    await interaction.reply('❌ This channel is not a counting channel.');
}

async function leaderboard(interaction: ChatInputCommandInteraction) {
  /*const result = await db.insert(countingTable).values({id: interaction.channel.id}).onConflictDoNothing()
  const document: any = await data.findOne({}, { sort: { count: -1 } });

  if (!document) return interaction.reply(`❌ No counting channels exist.`);

  const guild = (await interaction.client.channels.fetch(document.channel) as GuildChannel)
    ?.guild;

  if (guild)
  return interaction.reply(`🏆 **${guild}** currently has the highest count at **${document.count}**!`); */
}