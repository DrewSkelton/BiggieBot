const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'counting',
  description: 'Manages a counting channel where users count up one by one using numbers, Roman numerals, or math expressions',
  featureIcon: '🔢',
  
  // Current count storage
  currentCount: 0,
  lastUserId: null, // Track the last user who counted
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
      
      // Get the content of the message
      let content = message.content.trim();
      content = content.replace('```', '');
      content = content.replace('^', '**');
      
      // Try to interpret the content as a number, Roman numeral, or math expression
      let number = null;
      
      // First try to parse as a regular integer
      // Because the math expression already will parse a normal integer, this step isn't needed
      //if (/^\d+$/.test(content)) {
      //  number = parseInt(content);
      //}
      // Try to parse as a Roman numeral
      if (/^[IVXLCDM]+$/.test(content)) {
        number = this.parseRomanNumeral(content);
      }
      // Try to evaluate as a math expression
      else if (/^[[:xdigit:]\s+\-*\/().OoXx]+$/.test(content)) {
        try {
          number = this.evaluateMathExpression(content);
        } catch (error) {
          // Invalid math expression
          number = null;
        }
      }
      
      // If we couldn't parse as any valid format, don't react
      if (number === null) {
        return;
      }
      
      // Check if the same user is trying to count twice in a row
      if (message.author.id === this.lastUserId) {
        message.react('❌');
        message.channel.send(`<@${message.author.id}> tried to count twice in a row! The count has been reset from ${this.currentCount + 1} to 0.`);
        
        try {
            const guild = message.guild;
            const member = guild.members.cache.get(message.author.id);
            
            if (member) {
              const nickname = member.nickname || member.user.username;
              message.channel.send(`${nickname} ruined it for everyone!`);
            }
          } catch (error) {
            console.error('Error getting member nickname:', error);
        }
        // Reset the count after sending the message
        this.currentCount = 0;
        this.lastUserId = null;
        this.saveCount();
        return;
      }
      
      // Check if the number is the next in sequence
      if (number === this.currentCount + 1) {
        this.currentCount = number;
        this.lastUserId = message.author.id; // Update the last user
        this.saveCount();
        message.react('✅');
      } else {
        message.react('❌');
        message.channel.send(`Counting failed at ${number}! The next number should have been ${this.currentCount + 1}. Starting over from 0.`);
        
        // Get the user who messed up and use their nickname if available
        try {
          const guild = message.guild;
          const member = guild.members.cache.get(message.author.id);
          
          if (member) {
            const nickname = member.nickname || member.user.username;
            message.channel.send(`${nickname} ruined it for everyone!`);
          }
        } catch (error) {
          console.error('Error getting member nickname:', error);
        }
        
        // Reset the count after sending the message
        this.currentCount = 0;
        this.lastUserId = null; // Reset last user
        this.saveCount();
      }
    });
    
    console.log('Counting feature initialized');
  },
  
  // Parse Roman numeral to integer
  parseRomanNumeral(str) {
    const romanStr = str.toUpperCase();
    const romanMap = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000
    };
    
    let result = 0;
    let i = 0;
    
    while (i < romanStr.length) {
      // Get current and next values
      const current = romanMap[romanStr[i]];
      const next = i + 1 < romanStr.length ? romanMap[romanStr[i + 1]] : 0;
      
      // If current is greater than or equal to next, add current
      if (current >= next) {
        result += current;
        i++;
      } 
      // If current is less than next, subtract current from next and add
      else {
        result += (next - current);
        i += 2;
      }
    }
    
    return result;
  },
  
  // Evaluate math expressions
  evaluateMathExpression(expr) {
    try {
      // Use Function constructor to safely evaluate the expression
      const sanitizedExpr = expr.replace(/\s+/g, ''); // Remove all spaces
      const result = new Function(`return ${sanitizedExpr}`)();
      
      // Check if result is a valid number and an integer
      if (isNaN(result) || !isFinite(result) || !Number.isInteger(result)) {
        return null;
      }
      
      return result;
    } catch (error) {
      return null;
    }
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
        this.lastUserId = data.lastUserId || null;
      }
    } catch (error) {
      console.error('Error loading count:', error);
      this.currentCount = 0;
      this.lastUserId = null;
    }
  },
  
  saveCount() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify({ 
        count: this.currentCount,
        lastUserId: this.lastUserId
      }), 'utf8');
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
    this.lastUserId = null;
    this.saveCount();
  }
};