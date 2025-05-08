const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

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
  
  // Current question index
  currentQuestionIndex: 0,
  
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
  
  loadSettings() {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'));
        this.channelId = settings.channelId || null;
        this.currentQuestionIndex = settings.currentQuestionIndex || 0;
      } else {
        this.channelId = null;
        this.currentQuestionIndex = 0;
      }
    } catch (error) {
      console.error('Error loading daily question settings:', error);
      this.channelId = null;
      this.currentQuestionIndex = 0;
    }
  },
  
  saveSettings() {
    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify({ 
        channelId: this.channelId,
        currentQuestionIndex: this.currentQuestionIndex
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
    
    // Get the channel to post in
    const channel = client.channels.cache.get(this.channelId);
    
    if (!channel) return;
    
    // Check if there are questions left
    if (this.currentQuestionIndex >= this.questions.length) {
      channel.send("**Daily Question:** Out of questions");
      return;
    }
    
    // Get the next question in order
    const question = this.questions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    this.saveSettings();
    
    // Send the question
    channel.send(`**Daily Question:** ${question}`);
  }
};