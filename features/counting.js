const fs = require('fs');
const database = require('../utils/database');

module.exports = {
  name: 'counting',
  description: 'Manages a counting channel where users count up one by one using numbers, Roman numerals, or math expressions',
  featureIcon: '🔢',
  
  async init(client) {
    const collection = await database.collection("counting");

    client.on('messageCreate', async (message) => {
      const data = await collection.findOne({ _id: message.channel.id });
      
      // Skip if counting channel isn't set or message is in a different channel
      if (data == null) return;
      if (message.author.bot) return;
      
      // Get the content of the message
      let content = message.content.trim().replaceAll('```', '');
      
      // Try to interpret the content as a number, Roman numeral, or math expression
      let number = null;
      
      // Try to parse as a Roman numeral
      if (/^[IVXLCDM]+$/.test(content)) {
        number = this.parseRomanNumeral(content);
      }
      // Try to evaluate as a math expression
      else if (/^[\da-fA-F\s+\-*\/^().OoXx]+$/.test(content)) {
        number = this.evaluateMathExpression(content);
      }

      // If we couldn't parse as any valid format, don't react
      if (number == null) {
        return;
      }
      
      // Check if the same user is trying to count twice in a row
      if (message.author.id === data.userId) {
        // Reset the count before sending the message
        collection.updateOne(data, {
          $set: {
            count: 0,
            userId: null
          }
        });

        message.react('❌');
        message.reply(`You can't count twice in a row! The count has been reset from ${data.count + 1} to 0`);
        message.channel.send(`<@${message.author.id}> ruined it for everyone!`);
      }
      
      // Check if the number is the next in sequence
      else if (number !== data.count + 1) {
        // Reset the count before sending the message
        collection.updateOne(data, {
          $set: {
            count: 0,
            userId: null
          }
        });

        message.react('❌');
        message.reply(`Counting failed at ${number}! The next number should have been ${data.count + 1}. Starting over from 0.`);
        message.channel.send(`<@${message.author.id}> ruined it for everyone!`); 
      }
      
      // Update the current count to the new count
      else {
        collection.updateOne(data, {
          $set: {
            count: number,
            userId: message.author.id
          }
        });
        message.react('✅');
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
      const sanitizedExpr = expr.replace(/\s+/g, '').replaceAll('^', '**'); // Remove all spaces and replace ^ with **

      // Keep a close eye on this function; it could possibly be malicious
      const result = new Function(`return ${sanitizedExpr}`)();
      
      // Check if result is a valid number and an integer
      if (!isNaN(result) && isFinite(result) && Number.isInteger(result)) {
        return result;
      }
    } catch {}
    return null;
  }
};