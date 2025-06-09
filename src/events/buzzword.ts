import { Client, ClientApplication, Events, Message } from "discord.js";
import database from "../utils/database.js";

const data = database('buzzword');

export const on = Events.MessageCreate;

export async function execute(message: Message) {
    if (message.author.bot) return;

    const document: any = await data.findOne({guild: message.guild.id, buzzwords: {$type: 'array'}});
    if (!document) return;

    for (const buzzword of document.buzzwords) {
        if (message.content.toLowerCase().includes(buzzword.buzzword)) {
            return message.reply(buzzword.response);
        }
    }
}