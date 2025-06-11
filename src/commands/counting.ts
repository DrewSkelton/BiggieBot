import { ChatInputCommandInteraction, GuildChannel, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import database from '../utils/database.js';

const data = database('counting');

export const command = new SlashCommandBuilder()
    .setName('counting')
    .setDescription('Manages counting.')
    .addSubcommand(leaderboard => leaderboard
      .setName('leaderboard')
      .setDescription('Sends what server has the highest count.')
    )
    .addSubcommand(set => set
        .setName('set')
        .setDescription('Sets the current channel for counting.')
    )
    .addSubcommand(remove => remove
        .setName('remove')
        .setDescription('Removes the current channel form counting')
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
  
  const result = await data.updateOne({channel: interaction.channel.id}, {
    $setOnInsert: {
      channel: interaction.channel.id,
      count: 0,
      last_user: null
    }
  },
  {upsert: true});

  if (result.upsertedCount > 0) {
    await interaction.reply('✅ This channel has been set as a counting channel! Start counting from 1.');
  }

  else {
    await interaction.reply('❌ This channel is already a counting channel.');
  }
}

async function remove(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.reply({
    content: '❌ You do not have permission to manage channels.',
    flags: MessageFlags.Ephemeral
  });
  
  const result = await data.deleteOne({channel: interaction.channel.id})

  if (result.deletedCount > 0) {
    await interaction.reply('✅ This channel has been removed as the counting channel!');
  }

  else {
    await interaction.reply('❌ This channel is not a counting channel.');
  }
}

async function leaderboard(interaction: ChatInputCommandInteraction) {
  const document: any = await data.findOne({}, { sort: { count: -1 } });

  if (!document) return interaction.reply(`❌ No counting channels exist.`);

  const guild = (await interaction.client.channels.fetch(document.channel) as GuildChannel)
    ?.guild;

  if (guild)
  return interaction.reply(`🏆 **${guild}** currently has the highest count at **${document.count}**!`);
}