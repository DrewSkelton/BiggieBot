import { Client, ClientApplication, Events } from "discord.js";
import database from "../utils/database";
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
    const document: any = await data.findOne({channels: {$type: 'array'}, questions: {$type: 'array'}});
    if (!document) return;

    //Pick a random question
    const question = document.questions[Math.floor(Math.random() * document.questions.length)];
    
    //Remove the question from the pool
    data.updateOne( {}, {
      $pull: {
        questions: question
      }
    });
    
    // Check if channels is iterable
    if (!(Symbol.iterator in Object(document.channels))) return;
    
    for (const channelId of document.channels) {
        // Get the channel to post in
        const channel: any = client.channels.cache.get(channelId);
        
        if (!channel) {
          // Remove the channel from the list if it doesn't exist anymore
          data.updateOne( {}, {
            $pull: {
              channels: channelId
            }}
          );
        }

        else if (question) {
            channel.send(`**Daily Question:** ${question}`);
        }
    }
}