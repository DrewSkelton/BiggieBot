const cron = require('node-cron');
const database = require('../utils/database.js');

module.exports = {
  name: 'dailyQuestion',
  description: 'Posts daily questions in a specific channel',
  
  // Questions pool
  questions: [
    "Send a screenshot of your phone's screen time",
    "When's the last time you've washed your bed's comforter/sheets?",
    "What's your spirit animal?",
    "What's your favorite song right now?",
    "What is the best chicken restaurant?",
    "How old were you when you got on social media for the first time?",
    "Who in the group do you think would make the best dorm (same-room) roommate?",
    "On a scale of 1-10, how much do you want to kiss Ian?",
    "What is your dream car? (show photo)",
    "If you had to drink the bath water of one person in this group, who would it be?",
    "Would you move somewhere other than Oklahoma post-grad? If so, where?",
    "If you could commit one crime and get away with it, what would it be?",
    "What is your biggest pet peeve?",
    "If you could play one musical instrument, what would it be?",
  ],

  async init(client) {
    // Initialize database with questions
    // This is only for testing
    // (Maybe users can DM the bot questions?)
    const collection = await database.collection('daily_question');
    await collection.updateOne( {}, {
      $addToSet: {
          questions: {$each: this.questions}
        }},
        {upsert: true});
    
    // Schedule the first daily question at 9 AM
    cron.schedule('0 9 * * *', () => {
      this.askDailyQuestion(client);
    });

    // Schedule the second daily question at 12 PM (noon)
    cron.schedule('0 12 * * *', () => {
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

      if (question == null) {
        channel.send("**Daily Question:** Out of questions");
        return;
      }

      else {
        channel.send(`**Daily Question:** ${question}`);
      }
    }
  }
};