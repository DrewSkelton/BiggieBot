const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'dailyQuestion',
  description: 'Posts a daily question in a specific channel',
  
  // Questions pool
  questions: [
    "If you could have infinite food or infinite money (you can only spend 30$ on food every day), which would you choose?",
    "If you could get rid of any fictional character, who would it be?",
    "What's your spirit animal?",
    "If you had to eat one food for the rest of your life, what would it be?",
    "What is your least favorite food?",
    "What's your favorite song right now?",
    "Would you rather bite ice cream or a slushy?",
    "What is the best chicken restaurant?",
    "What is the worst type of food to get at a restaurant and why is it pizza?",
  ],
  
  // Settings storage
  settingsFile: path.join(__dirname, '../data/dailyQuestionSettings.json'),
  
  init(client) {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Load settings from file
    this.loadSettings();
    
    // Schedule daily question at 9 AM
    cron.schedule('0 9 * * *', () => {
      this.askDailyQuestion(client);
    });
    
    console.log('Daily question feature initialized');
  },
  
  loadSettings() {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'));
        this.channelId = settings.channelId || null;
      } else {
        this.channelId = null;
      }
    } catch (error) {
      console.error('Error loading daily question settings:', error);
      this.channelId = null;
    }
  },
  
  saveSettings() {
    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify({ 
        channelId: this.channelId 
      }), 'utf8');
    } catch (error) {
      console.error('Error saving daily question settings:', error);
    }
  },
  
  setChannel(channelId) {
    this.channelId = channelId;
    this.saveSettings();
    return true;
  },
  
  askDailyQuestion(client) {
    // Skip if no channel is set
    if (!this.channelId) return;
    
    // Get a random question
    const question = this.questions[Math.floor(Math.random() * this.questions.length)];
    
    // Get the channel to post in
    const channel = client.channels.cache.get(this.channelId);
    
    if (channel) {
      channel.send(`**Daily Question:** ${question}`);
    }
  }
};