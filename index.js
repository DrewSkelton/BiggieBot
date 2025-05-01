const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Create collections for commands and features
client.commands = new Collection();
client.features = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command && 'execute' in command) {
      client.commands.set(command.name, command);
      console.log(`Loaded command: ${command.name}`);
    }
  }
}

// Load features
const featuresPath = path.join(__dirname, 'features');
if (fs.existsSync(featuresPath)) {
  const featureFiles = fs.readdirSync(featuresPath).filter(file => file.endsWith('.js'));
  
  for (const file of featureFiles) {
    const filePath = path.join(featuresPath, file);
    const feature = require(filePath);
    if ('name' in feature && 'init' in feature) {
      client.features.set(feature.name, feature);
      // Initialize each feature with the client
      feature.init(client);
      console.log(`Loaded feature: ${feature.name}`);
    }
  }
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Message command handler
client.on(Events.MessageCreate, async message => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Command handler (assuming commands start with "!")
  if (message.content.startsWith('!')) {
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = client.commands.get(commandName);
    if (!command) return;
    
    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(error);
      await message.reply('There was an error executing that command!');
    }
  }
});

// Log in to Discord with your token
client.login(process.env.DISCORD_TOKEN);