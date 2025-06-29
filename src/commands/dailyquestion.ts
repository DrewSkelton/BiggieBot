import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import database from '../utils/database.js';

const data = database('daily_question');
const limit = 3;

export const command = new SlashCommandBuilder()
    .setName('dailyquestion')
    .setDescription('Manages daily questions')
    .addSubcommand(set => set
        .setName('set')
        .setDescription('Sets the current channel to recive daily questions.')
    )
    .addSubcommand(remove => remove
        .setName('remove')
        .setDescription('Removes the current channel from reciving daily questions.')
    )
    .addSubcommand(get => get
      .setName('get')
      .setDescription('Get the current daily question.')
    )
    .addSubcommand(submit => submit
        .setName('submit')
        .setDescription('Submits your daily question.')
        .addStringOption(option => option
          .setName('question')
			    .setDescription('The question to submit.')
          .setRequired(true))
    )
    

export async function execute(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
        case 'set': return set(interaction);
        case 'remove': return remove(interaction);
        case 'get': return get(interaction);
        case 'submit': return submit(interaction);
    }
}

async function set(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.reply({
    content: '❌ You do not have permission to manage channels.',
    flags: MessageFlags.Ephemeral
  });

  const result = await data.updateOne( {}, {
    $addToSet: {
      channels: interaction.channel.id
    }},
    {upsert: true}
  );

  if (result.modifiedCount > 0) {
    await interaction.reply('✅ This channel has been set for daily questions! Questions will be posted here at 9 AM every day.');
  }
  else {
    await interaction.reply('❌ This channel has already been added for daily questions.');
  }
}

async function remove(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) return interaction.reply({
    content: '❌ You do not have permission to manage channels.',
    flags: MessageFlags.Ephemeral
  });

  const result = await data.updateOne( {}, {
    $pull: {
      channels: interaction.channel.id
    }}
  );
  
  if (result.modifiedCount > 0) {
    await interaction.reply('✅ This channel has been removed for daily questions!');
  }

  else {
    await interaction.reply('❌ This channel is not added for daily questions.');
  }
}

async function submit(interaction: ChatInputCommandInteraction) {
  const document: any = await data.findOne({});
  
  // See if the user has been banned by searching the banned_users array for their ID
  if (document?.banned_users?.contains(interaction.user.id)) return interaction.reply({
    content: '❌ You have been banned from submitting daily questions.',
    flags: MessageFlags.Ephemeral
  });

  // See if the user has submitted the limit
  let count = 0;
  if (document?.questions) {
    for (const question of document.questions) {
      if (question?.author == interaction.user.id) count++
      if (count >= limit) return interaction.reply({
        content: `❌ You can only submit up to ${limit} questions.`,
        flags: MessageFlags.Ephemeral
      });
    }  
  }
  
  // Because the first value of the questions array is considered as the current question,
  // whenever a new question is added to an empty array, the first element must be prepended with null
  // to signify that their is still no current question for the day
  if (document?.questions == undefined || document?.questions.length === 0)
  await data.updateOne({}, {
    $addToSet: {
      questions: null
    }
  },
  {upsert: true})
  
  // Adds an object to the questions array which contains the question (content) and the user's id
  const result = await data.updateOne({}, {
    $addToSet: {
      questions: {
        content: interaction.options.getString('question'),
        author: interaction.user.id
      }
    }},
  );

  if (result.modifiedCount > 0) {
    return interaction.reply({
      content: '✅ Your daily question has been submitted!',
      flags: MessageFlags.Ephemeral
    });
  }

  else return interaction.reply({
    content: '❌ You have already submitted this question',
    flags: MessageFlags.Ephemeral
  });
}

async function get(interaction: ChatInputCommandInteraction) {
  const document: any = await data.findOne({
    questions: {
      $type: 'array'
    }
  })

  const question = document?.questions[0]?.content
  if (question) {
    return interaction.reply(question);
  }
  else {
    return interaction.reply('❌ There is no daily question today')
  }
}