const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'setdailyquestion',
  description: 'Sets the current channel for daily questions',
  feature: 'dailyQuestion',
  execute(message, args, client) {
    // Check if user has administrator permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ You need administrator permissions to use this command.');
    }
    
    // Get the daily question feature
    const dailyQuestionFeature = client.features.get('dailyQuestion');
    if (!dailyQuestionFeature) {
      return message.reply('❌ The daily question feature is not loaded.');
    }
    
    // Set the current channel for daily questions
    dailyQuestionFeature.setChannel(message.channel.id);
    
    return message.reply('✅ This channel has been set for daily questions! Questions will be posted here at 9 AM every day.');
  },
};