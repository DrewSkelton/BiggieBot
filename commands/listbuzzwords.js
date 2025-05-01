module.exports = {
  name: 'listbuzzwords',
  description: 'Lists all buzzwords and their responses',
  feature: 'buzzwordResponse',
  execute(message, args, client) {
    // Get the buzzword feature
    const buzzwordFeature = client.features.get('buzzwordResponse');
    if (!buzzwordFeature) {
      return message.reply('❌ The buzzword feature is not loaded.');
    }
    
    // Check if there are any buzzwords
    const buzzwords = buzzwordFeature.buzzwords;
    if (Object.keys(buzzwords).length === 0) {
      return message.reply('No buzzwords have been added yet.');
    }
    
    // Create the response message
    const listMessage = [];
    listMessage.push('# 📝 Buzzword Responses');
    listMessage.push('');
    
    const userId = message.author.id;
    
    // List all buzzwords and their responses
    for (const [word, data] of Object.entries(buzzwords)) {
      const isOwner = data.userId === userId;
      listMessage.push(`- **${word}**: ${data.response}${isOwner ? ' (yours)' : ''}`);
    }
    
    // Add note about limits
    const userBuzzwordCount = buzzwordFeature.getUserBuzzwordCount(userId);
    listMessage.push('');
    listMessage.push(`You have created ${userBuzzwordCount}/2 buzzwords.`);
    
    // Send the list
    return message.reply(listMessage.join('\n'));
  },
};