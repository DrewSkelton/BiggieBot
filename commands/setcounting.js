const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'setcounting',
  description: 'Sets the current channel as the counting channel',
  feature: 'counting',
  execute(message, args, client) {
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
    countingFeature.setCountingChannel(message.channel.id);
    countingFeature.resetCount(); // Reset count to 0
    
    return message.reply('✅ This channel has been set as the counting channel! Start counting from 1.');
  },
};