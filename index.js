const { Client, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Listen for messages
client.on(Events.MessageCreate, async message => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Basic command handling with prefix "!"
  if (message.content.startsWith('!hello')) {
    await message.reply('Hello there!');
  }
});

// Log in to Discord with your token
client.login(process.env.DISCORD_TOKEN);