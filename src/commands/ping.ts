import { SlashCommandBuilder } from "discord.js";

export const name = 'ping';

export const command = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Replies with Pong!');

export async function execute(interaction) {
    await interaction.reply('Pong!')
}