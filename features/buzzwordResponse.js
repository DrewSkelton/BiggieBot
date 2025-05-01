const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'buzzwordResponse',
  description: 'Responds to specific buzzwords in messages',
  
  // Buzzwords and their responses with user ownership
  buzzwords: {
    // Format: "keyword": { response: "response text", userId: "creator's user ID" }
  },
  
  // Path to the data file where buzzwords are stored
  dataFile: path.join(__dirname, '../data/buzzwords.json'),
  
  init(client) {
    // Load buzzwords from file
    this.loadBuzzwords();
    
    client.on('messageCreate', (message) => {
      // Ignore bot messages
      if (message.author.bot) return;
      
      // Check for buzzwords
      const content = message.content.toLowerCase();
      for (const [word, data] of Object.entries(this.buzzwords)) {
        if (content.includes(word.toLowerCase())) {
          message.reply(data.response);
          break; // Only respond once per message
        }
      }
    });
    
    console.log('Buzzword response feature initialized');
  },
  
  // Load buzzwords from the data file
  loadBuzzwords() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.buzzwords = data;
      }
    } catch (error) {
      console.error('Error loading buzzwords:', error);
      this.buzzwords = {};
    }
  },
  
  // Save buzzwords to the data file
  saveBuzzwords() {
    try {
      // Ensure the data directory exists
      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(this.dataFile, JSON.stringify(this.buzzwords, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving buzzwords:', error);
    }
  },
  
  // Count how many buzzwords a user has created
  getUserBuzzwordCount(userId) {
    let count = 0;
    for (const data of Object.values(this.buzzwords)) {
      if (data.userId === userId) {
        count++;
      }
    }
    return count;
  },
  
  // Add a new buzzword
  addBuzzword(word, response, userId) {
    // Store with lowercase key for case-insensitive lookup
    this.buzzwords[word.toLowerCase()] = {
      response: response,
      userId: userId,
      originalWord: word // Keep original casing for display
    };
    this.saveBuzzwords();
  },
  
  // Remove a buzzword
  removeBuzzword(word) {
    const result = delete this.buzzwords[word.toLowerCase()];
    this.saveBuzzwords();
    return result;
  }
};
