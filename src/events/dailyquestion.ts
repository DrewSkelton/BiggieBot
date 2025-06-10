import { Client, Events, TextChannel } from "discord.js";
import database from "../utils/database.js";
import cron from 'node-cron'

const data = database('daily_question');

export const once = Events.ClientReady;

export async function execute(client: Client) {
    // Schedule a daily question at 9 AM
    cron.schedule('0 9 * * *', () => {
      askDailyQuestion(client);
    });
}

async function askDailyQuestion(client: Client) {
  // Remove the previous daily question and make the next one the new current one (by removing the first question in the queue)
  const document: any = await data.findOneAndUpdate({
    channels: {$type: 'array'}, questions: {$type: 'array'}
  },
  {
    $pop: {
      questions: -1
    }
  },
  {returnDocument: "after"});

  if (!document?.channels || !document?.questions[0]) return;

  //Pick the first question
  const question = document.questions[0];
    
    for (const channelId of document.channels) {
      // Get the channel to post in
      const channel = client.channels.cache.get(channelId) as TextChannel;

      // Remove the channel from the list if the bot can't find it anymore
      if (!channel) {
        data.updateOne( {}, {
        $pull: {
          channels: channelId
        }});
      }

      // Temporary fix for questions formated in the old style
      if (question.content) await channel.send(`**Daily Question:** ${question.content}`);
      else await channel.send(`**Daily Question:** ${question}`);
      
    }
}