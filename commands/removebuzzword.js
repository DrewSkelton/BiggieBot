const database = require('../utils/database');

module.exports = {
  name: 'removebuzzword',
  description: 'Removes a buzzword you\'ve created',
  feature: 'buzzwordResponse',
  async execute(message, args, client) {
    // Get the full command content and remove the command prefix
    const buzzword = message.content.slice(message.content.indexOf(' ') + 1).trim().toLowerCase();
    
    // Check if a buzzword was provided
    if (!buzzword) {
      return message.reply('❌ Please provide the buzzword to remove. Usage: `!removebuzzword keyword/phrase`');
    }
    
    // Get the buzzword feature
    const buzzwordFeature = client.features.get('buzzwordResponse');
    if (!buzzwordFeature) {
      return message.reply('❌ The buzzword feature is not loaded.');
    }

    const data = await database.collection('buzzword')
    const result = await data.findOne({
      _id: message.guild.id,
      [buzzword]: {$exists: true}
    });
    
    // Check if buzzword exists
    if (result == undefined) {
      return message.reply('❌ This buzzword does not exist.');
    }
    
    const userId = message.author.id;
    const isAdmin = message.member.permissions.has('Administrator');
    
    // Check if the user owns this buzzword or is an admin
    if (result[buzzword].owner !== userId && !isAdmin) {
      return message.reply('❌ You can only remove buzzwords that you have created.');
    }
    
    // Remove the buzzword
    data.updateOne(result,
      {$unset: {[buzzword]: undefined}}
    );
    
    return message.reply(`✅ Removed buzzword "${buzzword}".`);
  },
};