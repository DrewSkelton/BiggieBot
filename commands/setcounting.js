const { PermissionsBitField } = require('discord.js');
const database = require('../utils/database.js')

module.exports = {
  name: 'setcounting',
  description: 'Sets the current channel as the counting channel',
  feature: 'counting',
  async execute(message, args, client) {
    // Check if user has administrator permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ You need administrator permissions to use this command.');
    }
    
    // Get the counting feature
    const countingFeature = client.features.get('counting');
    if (!countingFeature) {
      return message.reply('❌ The counting feature is not loaded.');
    }
    
    // Set the current channel as the counting channel
    const collection = await database.collection("counting")

    const result = await collection.findOneAndDelete({_id: message.channel.id});

    if (result == null) {
      await collection.insertOne({
        _id: message.channel.id,
        userId: null,
        count: 0
      });

      return message.reply('✅ This channel has been set as the counting channel! Start counting from 1.');
    }
    
    return message.reply('❌ This channel has been removed as the counting channel.');
    
  },
};