import { ChatInputCommandInteraction, Interaction, MessageFlags, Options, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import database from '../utils/database.js';

const data = database('counting');

export const command = new SlashCommandBuilder()
    .setName('counting')
    .setDescription('Manages counting')
    .addSubcommand(set => set
        .setName('set')
        .setDescription('Sets the current channel for counting')
    )
    .addSubcommand(remove => remove
        .setName('remove')
        .setDescription('Removes the current channel form counting')
        .addBooleanOption(option => option
            .setName('all')
            .setDescription('Removes every channel from counting')
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)

export async function execute(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
        case 'set': return set(interaction);
        case 'remove': return remove(interaction);
        case 'list': return list(interaction);
    }
}

async function set(interaction: ChatInputCommandInteraction) {
  const result = await data.updateOne( {}, {
    $set: {
      [interaction.channel.id]: {
        count: 0,
        last_user: null
      }
    }},
    {upsert: true}
  );

  if (result.modifiedCount != 0) {
    await interaction.reply('✅ This channel has been set as a counting channel! Start counting from 1.');
  }
  else {
    await interaction.reply('❌ This channel is already a counting channel.');
  }
}

async function remove(interaction: ChatInputCommandInteraction) {
  const result = await data.updateOne( {}, {
        $unset: {[interaction.channel.id]: ''}
    });
  
  if (result.modifiedCount != 0) {
    await interaction.reply('✅ This channel has been removed as the counting channel!');
  }

  else {
    await interaction.reply('❌ This channel is not a counting channel.');
  }
}

async function list(interaction: ChatInputCommandInteraction) {

}