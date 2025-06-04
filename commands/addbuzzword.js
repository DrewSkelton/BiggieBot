const database = require('../utils/database');

module.exports = {
  name: 'addbuzzword',
  description: 'Adds a new buzzword and response (limit: 2 per user)',
  feature: 'buzzwordResponse',
  async execute(message, args, client) {
    const data = await database.collection('buzzword');
    
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

    // Split at the first comma to separate buzzword and response
    const [word, response] = fullContent.split(',', 2).map(s => s.trim());

    // Check if both parts are provided
    if (!word || !response) {
      return message.reply('❌ Please provide both a buzzword and a response separated by a comma. Usage: `!addbuzzword keyword/phrase, response text`');
    }

    const userId = message.author.id;

    const result = await data.findOne({
      _id: message.guild.id,
    });
    
    //If the user is admin, then user count will be -1
    let userBuzzwordCount = message.member.permissions.has('Administrator') ? -1: 0;
    
    if (result != null) {
      for (const [buzzword, data] of Object.entries(result)) {
        // Check if buzzword already exists
        if (buzzword == word.toLowerCase()) {
          return message.reply('❌ This buzzword already exists.');
        }
      
        // Check if the user already has 2 buzzwords (unless they're an admin)
        if (userBuzzwordCount >= 0 && data.owner == userId) {
          userBuzzwordCount++;
        }
      
        if (userBuzzwordCount >= 2) {
          return message.reply('❌ You can only add up to 2 buzzwords. You can use `!removebuzzword keyword/phrase` to remove one of your existing buzzwords.');
        }
      }

    }
    
    // Add the buzzword
    await data.findOneAndUpdate({_id: message.guild.id}, {
      $set: {
        [word.toLowerCase()]: {
          response: response,
          owner: userId
        } 
      }
    },
    {upsert: true});

    if (userBuzzwordCount < 0) {
      return message.reply(`✅ Added buzzword "${word}" with response: "${response}".`);
    }

    return message.reply(`✅ Added buzzword "${word}" with response: "${response}". You've used ${userBuzzwordCount + 1}/2 of your buzzword slots.`);
  },
};