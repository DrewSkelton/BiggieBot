# BiggerBot

A fun Discord bot built by CS C&C with `discord.js`.  
**THIS BOT IS BIG!!!!!!!! #MakeAmericaBigAgain**

## 🚀 Setup

1. Clone this repository  
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a bot in the [Discord Developer Portal](https://discord.com/developers/applications)  
4. Get your bot token and add it to the `.env` file  
5. Invite the bot to your server with the required permissions  
6. Run the bot:

   ```bash
   npm start
   ```

## ✨ Features

### Commands

- `!hello` - Bot responds with a greeting  
- `!help` - Displays all available commands and features  
- `!setcounting` - Sets the current channel as the counting channel (Admin only)  
- `!setdailyquestion` - Sets the current channel for daily questions (Admin only)  
- `!addbuzzword keyword/phrase, response` - Adds a new buzzword and response (limit: 2 per user)  
- `!removebuzzword keyword/phrase` - Removes a buzzword you've created  
- `!listbuzzwords` - Lists all buzzwords and their responses  

### Automated Features

- **Daily Questions** – Posts a random question every day  
- **Buzzword Responses** – Responds to specific keywords in messages  
- **Counting Channel** – Maintains a channel where users count sequentially  

## 📁 Project Structure

```
BiggerBot/
├── commands/                 # Command files
│   ├── help.js              # Help command
│   └── ... (other commands)
├── features/                 # Feature modules
│   ├── dailyQuestion.js     # Daily question feature
│   └── ... (other features)
├── data/                     # Data storage directory
│   └── ... (JSON data files)
├── utils/                    # Utility functions
│   └── ... (utility scripts)
├── index.js                  # Main bot file
├── config.js                 # Configuration
└── ... (other project files)
```

## 🧩 Adding New Features

Create a file `yourFeature.js` in the `features/` folder:

```js
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'yourFeature',
  description: 'Feature description',
  featureIcon: '🔹',
  someProperty: 'value',
  settingsFile: path.join(__dirname, '../data/yourFeatureSettings.json'),

  init(client) {
    this.loadSettings();

    client.on('messageCreate', (message) => {
      // Your feature logic
    });

    console.log('Your feature initialized');
  },

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'));
        // Load settings
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  saveSettings() {
    try {
      const dataDir = path.dirname(this.settingsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(this.settingsFile, JSON.stringify({
        // Settings object
      }), 'utf8');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
};
```

## 💬 Adding Commands to Your New Feature

Create a file `yourcommand.js` in the `commands/` folder:

```js
module.exports = {
  name: 'yourcommand',
  description: 'Command description',
  feature: 'featureName',
  featureIcon: '🔹',
  usage: '<argument>',
  examples: ['example1', 'example2'],

  execute(message, args, client) {
    return message.reply('Command response');
  },
};
```

> The bot will update all commands and features on reload.  
> Currently running locally via `npm start`; deployment to Ben's server is planned.

---

## 📜 Legal

- [Privacy Policy](PRIVACY_POLICY.md)  
- [Terms of Service](TERMS_OF_SERVICE.md)
