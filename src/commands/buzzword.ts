import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import database, { db } from '../utils/database.js';
import { buzzwords } from '../schema/buzzwords.js';
import { eq } from 'drizzle-orm';

const data = database('buzzword');
const permission = PermissionFlagsBits.ManageGuild;
const limit = 5;

export const command = new SlashCommandBuilder()
    .setName('buzzword')
    .setDescription('Manages buzzwords')
    .addSubcommand(add => add
        .setName('add')
        .setDescription(`Adds a new buzzword and response (limit: ${limit} per user).`)
        .addStringOption(option => option
            .setName('buzzword')
            .setDescription('The phrase to listen for.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('response')
            .setDescription('What to respond with.')
            .setRequired(true))
    )
    .addSubcommand(remove => remove
        .setName('remove')
        .setDescription('Removes a buzzword you\'ve created.')
        .addStringOption(option => option
            .setName('buzzword')
            .setDescription('The buzzword to remove.')
            .setRequired(true))
    )
    .addSubcommand(list => list
        .setName('list')
        .setDescription('Lists all buzzwords and their responses.')
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
        case 'add': return add(interaction);
        case 'remove': return remove(interaction);
        case 'list': return list(interaction);
    }
}

async function add(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions.has(permission) && await getBuzzwordCount(interaction) >= limit) {
        return interaction.reply(`❌ You can only add up to ${limit} buzzwords.`)
    }

    const buzzword = interaction.options.getString('buzzword').toLowerCase();
    const response = interaction.options.getString('response');

    const result = await db.insert(buzzwords).values({
        guild: interaction.guild.id,
        trigger: buzzword,
        response: response,
        owner: interaction.user.id,
    })

    // TODO: Please actually check
    if (result.rowCount > 0) {
        await interaction.reply(`✅ Added buzzword "${buzzword}" with response: "${response}".`);
    }
    else {
        await interaction.reply('❌ This buzzword already exists.');
    }
}

async function remove(interaction: ChatInputCommandInteraction) {
    const buzzword = interaction.options.getString('buzzword').toLowerCase();

    const result = await db.delete(buzzwords).where(eq(buzzwords.guild, interaction.guild.id));
    if (result.rowCount > 0)
        await interaction.reply(`✅ Removed buzzword "${buzzword}".`);
    else
        await interaction.reply('❌ Could not find a buzzword owned by you which matches');
}

async function list(interaction: ChatInputCommandInteraction) {
    const document: any = await data.findOne({ guild: interaction.guild.id, buzzwords: { $type: "array" } });
    if (!document) return interaction.reply("❌ No buzzwords have been created yet!");

    let reply = '';
    let userBuzzwordCount = 0;

    for (const buzzword of document.buzzwords) {
        const isOwner = buzzword.owner === interaction.user.id;
        if (isOwner) userBuzzwordCount++;
        reply += (`- **${buzzword.buzzword}**: ${buzzword.response}${isOwner ? ' (yours)' : ''}\n`);
    }

    // Add note about limits
    reply += '\n';
    if (interaction.memberPermissions.has(permission)) {
        reply += (`You have created ${userBuzzwordCount} buzzwords`);
    }
    else {
        reply += `You have created ${userBuzzwordCount}/${limit} buzzwords.`;
    }

    await interaction.reply(reply);
}

async function getBuzzwordCount(interaction: ChatInputCommandInteraction): Promise<number> {
    const document: any = await data.findOne({ guild: interaction.guild.id });
    if (!document?.buzzwords) return 0;

    let count = 0;

    for (const buzzword of document.buzzwords) {
        if (buzzword.owner == interaction.user.id) count++;
    }
    return count;
}
