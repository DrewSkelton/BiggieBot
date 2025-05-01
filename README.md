# BiggerBot

A simple Discord bot built with discord.js.

## Setup

1. Clone this repository
2. Install dependencies:

```npm install```

3. Create a bot in the [Discord Developer Portal](https://discord.com/developers/applications)
4. Get your bot token and add it to the `.env` file
5. Invite the bot to your server with the required permissions
6. Run the bot:

```npm start```

## Features

### Commands
- `!hello` - Bot responds with a greeting
- `!help` - Displays all available commands and features
- `!setcounting` - Sets the current channel as the counting channel (Admin only)
- `!setdailyquestion` - Sets the current channel for daily questions (Admin only)
- `!addbuzzword keyword/phrase, response` - Adds a new buzzword and response (limit: 2 per user)
- `!removebuzzword keyword/phrase` - Removes a buzzword you've created
- `!listbuzzwords` - Lists all buzzwords and their responses

### Automated Features
- **Daily Questions** - Posts a random question every day
- **Buzzword Responses** - Responds to specific keywords in messages
- **Counting Channel** - Maintains a channel where users count sequentially

## Project Structure

BiggerBot/
├── commands/                 # Command files
│   ├── [help.js](http://_vscodecontentref_/0)               # Help command
│   └── ... (other commands)
├── features/                 # Feature modules
│   ├── [dailyQuestion.js](http://_vscodecontentref_/1)      # Daily question feature
│   └── ... (other features)
├── data/                     # Data storage directory
│   └── ... (JSON data files)
├── utils/                    # Utility functions
│   └── ... (utility scripts)
├── [index.js](http://_vscodecontentref_/2)                  # Main bot file
├── [config.js](http://_vscodecontentref_/3)                 # Configuration
└── ... (other project files)


## Adding New Features
### Create a file yourFeature.js in the features folder 
'''
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'yourFeature',              // Feature name (required)
  description: 'Feature description', // Feature description (required)
  featureIcon: '🔹',                // Icon for this feature (optional)
  
  // Any properties your feature needs
  someProperty: 'value',
  
  // Settings file path (recommended for persistence)
  settingsFile: path.join(__dirname, '../data/yourFeatureSettings.json'),
  
  // Init method (required) - called when the bot starts
  init(client) {
    // Initialize your feature
    this.loadSettings();
    
    // Set up event listeners
    client.on('messageCreate', (message) => {
      // Your feature logic for handling messages
    });
    
    console.log('Your feature initialized');
  },
  
  // Helper methods for your feature
  loadSettings() {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'));
        // Load your settings
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },
  
  saveSettings() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.settingsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Save your settings
      fs.writeFileSync(this.settingsFile, JSON.stringify({
        // Your settings object
      }), 'utf8');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
};
'''


## Adding Commands to Your New Feature
### Create a file yourcommands.js in the commands folder 

'''
module.exports = {
  name: 'yourcommand',              // Command name (required)
  description: 'Command description', // Command description (required)
  feature: 'featureName',           // Associated feature (optional)
  featureIcon: '🔹',                // Icon for this command (optional)
  usage: '<argument>',              // Usage information (optional)
  examples: ['example1', 'example2'], // Example usages (optional)
  
  execute(message, args, client) {
    // Your command logic here
    return message.reply('Command response');
  },
};
'''

## The bot will update all commands and features on reload
## We currently run the bot with a local npm start, but will use Ben's server eventually :)


## Legal
- [Privacy Policy](PRIVACY_POLICY.md)
- [Terms of Service](TERMS_OF_SERVICE.md)



