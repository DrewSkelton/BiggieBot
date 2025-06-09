import { Events, Message, TextChannel } from "discord.js";
import database from "../utils/database.js";
import * as math from "mathjs/number";

const data = database('counting');

export const on = Events.MessageCreate;

export async function execute(message: Message) {
    if (message.author.bot) return;

    const document: any = await data.findOne({channel: message.channel.id});
    if (!document) return;

    // Get the content of the message
    const content = message.content.trim().replaceAll('`', '');
      
    // Try to interpret the content as a number, Roman numeral, or math expression
    let number: number;
      
    // Try to parse as a Roman numeral
    if (/^[IVXLCDM]+$/.test(content)) {
      number = parseRomanNumeral(content);
    }

    // Try to evaluate as a math expression
    try {
      number = Number(math.evaluate(content))
    } catch { /* empty */ }

    // If we couldn't parse as any valid format, don't react
    if (number == undefined) {
      return;
    }
      
    // Check if the same user is trying to count twice in a row
    if (message.author.id === document.last_user) {
        // Reset the count before sending the message
        data.updateOne(document, {
          $set: {
            count: 0,
            last_user: null
          }
        });

        await message.react('❌');
        await message.reply(`Counting failed at **${document.count}**! You can't count twice in a row! The count has been reset.`);
        await (message.channel as TextChannel).send(`<@${message.author.id}> ruined it for everyone!`);
    }
      
    // Check if the number is the next in sequence
    else if (number !== document.count + 1) {
        // Reset the count before sending the message
        data.updateOne(document, {
          $set: {
            count: 0,
            userId: null
          }
        });

        await message.react('❌');
        await message.reply(`Counting failed at **${document.count}**! **${number}** is the wrong number! The counting has been reset.`);
        await (message.channel as TextChannel).send(`<@${message.author.id}> ruined it for everyone!`); 
    }
      
      // Update the current count to the new count
    else {
        data.updateOne(document, {
            $set: {
                count: number,
                last_user: message.author.id
            }
        });
        await message.react('✅');
    }
}

  // Parse Roman numeral to integer
function parseRomanNumeral(str: string): number {
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
}