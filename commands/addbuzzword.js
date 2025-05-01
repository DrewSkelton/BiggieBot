const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'addbuzzword',
  description: 'Adds a new buzzword and response (limit: 2 per user)',
  feature: 'buzzwordResponse',
  execute(message, args, client) {
    // Get the full command content and remove the command prefix
    const fullContent = message.content.slice(message.content.indexOf(' ') + 1);
    
    // Check if we have a comma separator
    if (!fullContent.includes(',')) {
      return message.reply('❌ Please separate your buzzword and response with a comma. Usage: `!addbuzzword keyword/phrase, response text`');
    }
    
    // Get the buzzword feature
    const buzzwordFeature = client.features.get('buzzwordResponse');
    if (!buzzwordFeature) {
      return message.reply('❌ The buzzword feature is not loaded.');
    }
    
    const userId = message.author.id;
    
    // Check if the user already has 2 buzzwords (unless they're an admin)
    const isAdmin = message.member.permissions.has('Administrator');
    const userBuzzwordCount = buzzwordFeature.getUserBuzzwordCount(userId);
    
    if (userBuzzwordCount >= 2 && !isAdmin) {
      return message.reply('❌ You can only add up to 2 buzzwords. You can use `!removebuzzword keyword/phrase` to remove one of your existing buzzwords.');
    }
    
    // Split at the first comma to separate buzzword and response
    const [buzzword, response] = fullContent.split(',', 2).map(s => s.trim());
    
    // Check if both parts are provided
    if (!buzzword || !response) {
      return message.reply('❌ Please provide both a buzzword and a response separated by a comma. Usage: `!addbuzzword keyword/phrase, response text`');
    }
    
    // Check if buzzword already exists
    if (buzzword.toLowerCase() in buzzwordFeature.buzzwords) {
      return message.reply('❌ This buzzword already exists.');
    }
    
    // Add the buzzword
    buzzwordFeature.addBuzzword(buzzword, response, userId);
    
    return message.reply(`✅ Added buzzword "${buzzword}" with response: "${response}". You've used ${userBuzzwordCount + 1}/2 of your buzzword slots.`);
  },
};