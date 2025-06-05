const database = require('../utils/database');

module.exports = {
  name: 'buzzwordResponse',
  description: 'Responds to specific buzzwords in messages',

  init(client) {
    client.on('messageCreate', async (message) => {
      const data = await database.collection('buzzword')
    
      // Ignore bot messages
      if (message.author.bot) return;

      // Check for buzzwords
      const result = await data.findOne({
        _id: message.guild.id,
      });

      for (const [buzzword, data] of Object.entries(result)) {
        if (buzzword != "_id" && message.content.toLowerCase().includes(buzzword)) {
          message.reply(data.response);
          break;
        } 
      }
      
    });
    
    console.log('Buzzword response feature initialized');
  }
};
