const cron = require('node-cron');
const database = require('../utils/database.js');

module.exports = {
  name: 'dailyQuestion',
  description: 'Posts daily questions in a specific channel',

  async init(client) {    
    // Schedule the first daily question at 9 AM
    cron.schedule('0 9 * * *', () => {
      this.askDailyQuestion(client);
    });

    console.log('Daily question feature initialized');
  },
  
  async askDailyQuestion(client) {
    const collection = await database.collection('daily_question');
    const data = await collection.findOne({});

    //Pick a random question
    const question = data.questions[Math.floor(Math.random() * data.questions.length)];

    //Remove the question from the pool
    collection.updateOne({}, {
      $pull: {
        questions: question
      }
    });

    if (!(Symbol.iterator in Object(data.channels))) return;

    for (let channelId of data.channels) {
      // Get the channel to post in
      const channel = await client.channels.fetch(channelId);
      
      if (channel == null) {
      //  // Remove the channel from the list if it doesn't exist anymore
      //  collection.updateOne( {}, {
      //    $pull: {
      //      channels: channelId
      //    }}
      //  );
        continue;
      };

      if (question != undefined) {
        channel.send(`**Daily Question:** ${question}`);
      }
    }
  }
};