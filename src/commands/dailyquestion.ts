import { ChatInputCommandInteraction, Interaction, MessageFlags, Options, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import database from '../utils/database.js';

const data = database('daily_question');

export const command = new SlashCommandBuilder()
    .setName('dailyquestion')
    .setDescription('Manages daily questions')
    .addSubcommand(set => set
        .setName('set')
        .setDescription('Sets the current channel for daily questions')
    )
    .addSubcommand(remove => remove
        .setName('remove')
        .setDescription('Removes the current channel for daily questions')
    )
    .addSubcommand(submit => submit
        .setName('submit')
        .setDescription('Submit a daily question')
        .addStringOption(option => option
          .setName('question')
			    .setDescription('The question to submit'))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)

export async function execute(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
        case 'set': { set(interaction); break; }
        case 'remove': { remove(interaction); break; }
        case 'submit': { submit(interaction); break; }
    }
}

async function set(interaction: ChatInputCommandInteraction) {
  const result = await data.updateOne( {}, {
    $addToSet: {
      channels: interaction.channel.id
    }},
    {upsert: true}
  );

  if (result.modifiedCount != 0) {
    interaction.reply('✅ This channel has been set for daily questions! Questions will be posted here at 9 AM every day.');
  }
  else {
    interaction.reply('❌ This channel has already been added for daily questions.');
  }
}

async function remove(interaction: ChatInputCommandInteraction) {
  const result = await data.updateOne( {}, {
    $pull: {
      channels: interaction.channel.id
    }}
  );
  
  if (result.modifiedCount != 0) {
    interaction.reply('✅ This channel has been removed for daily questions!');
  }

  else {
    interaction.reply('❌ This channel is not added for daily questions.');
  }
}

async function list(interaction: ChatInputCommandInteraction) {

}

async function submit(interaction: ChatInputCommandInteraction) {
  const question = interaction.options.getString('question')

  await data.updateOne( {}, {
    $addToSet: {
      questions: question
    }},
    {upsert: true}
  );

  interaction.reply({
    content: '✅ Your daily question has been submitted!',
    flags: MessageFlags.Ephemeral
  });
}