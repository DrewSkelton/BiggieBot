const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'counting',
  description: 'Manages a counting channel where users count up one by one',
  
  // Current count storage
  currentCount: 0,
  dataFile: path.join(__dirname, '../data/counting.json'),
  settingsFile: path.join(__dirname, '../data/countingSettings.json'),
  
  init(client) {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Load settings and current count from files
    this.loadSettings();
    this.loadCount();
    
    client.on('messageCreate', (message) => {
      // Skip if counting channel isn't set or message is in a different channel
      if (!this.countingChannelId || message.channelId !== this.countingChannelId) return;
      if (message.author.bot) return;
      
      // Try to parse the message as a number
      const number = parseInt(message.content);
      if (isNaN(number)) {
        message.react('❌');
        return;
      }
      
      // Check if the number is the next in sequence
      if (number === this.currentCount + 1) {
        this.currentCount = number;
        this.saveCount();
        message.react('✅');
      } else {
        message.react('❌');
        message.channel.send(`Counting failed at ${this.currentCount}! The next number should have been ${this.currentCount + 1}. Starting over from 0.`);
        this.currentCount = 0;
        this.saveCount();
      }
    });
    
    console.log('Counting feature initialized');
  },
  
  loadSettings() {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'));
        this.countingChannelId = settings.channelId || null;
      } else {
        this.countingChannelId = null;
      }
    } catch (error) {
      console.error('Error loading counting settings:', error);
      this.countingChannelId = null;
    }
  },
  
  saveSettings() {
    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify({ 
        channelId: this.countingChannelId 
      }), 'utf8');
    } catch (error) {
      console.error('Error saving counting settings:', error);
    }
  },
  
  loadCount() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.currentCount = data.count || 0;
      }
    } catch (error) {
      console.error('Error loading count:', error);
      this.currentCount = 0;
    }
  },
  
  saveCount() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify({ count: this.currentCount }), 'utf8');
    } catch (error) {
      console.error('Error saving count:', error);
    }
  },
  
  setCountingChannel(channelId) {
    this.countingChannelId = channelId;
    this.saveSettings();
    return true;
  },
  
  resetCount() {
    this.currentCount = 0;
    this.saveCount();
  }
};