import fs from 'node:fs'
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits, MessageFlags, REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js';
import 'dotenv/config'

//Helper function to recurse through an entire directory for commands or events
function* recurseDirectory(searchPath: string): Generator<string> {
	searchPath = path.resolve(searchPath);
	// Dirent is short for directory entity chat
	const dirents = fs.readdirSync(searchPath, {withFileTypes: true});
	for (const dirent of dirents) {
		if (dirent.isDirectory()) {
			yield* recurseDirectory(path.join(searchPath, dirent.name))
		}
		else if (dirent.isFile() && (path.extname(dirent.name) == '.js' || path.extname(dirent.name) == '.ts')) {
			yield path.join(searchPath, dirent.name)
		};
	}
}

//Client object
const client = Object.assign(
	new Client({ intents: [
		GatewayIntentBits.Guilds,
    	GatewayIntentBits.GuildMessages,
    	GatewayIntentBits.MessageContent
	]}),
	{
		commands: new Collection()
	}
) 

//Used for command registration
const commands: RESTPostAPIApplicationCommandsJSONBody[] = []

for (const file of recurseDirectory('src/commands')) {
	const command = await import(file);
	commands.push(command.command.toJSON());
	client.commands.set(command.command.name, command);
}

// Register commands 
const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT as string),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command: any = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

for (const file of recurseDirectory('src/events')) {
	const event = await import(file);
	if (event.once) {
		client.once(event.once, (...args) => event.execute(...args));
	}
	else {
		client.on(event.on, (...args) => event.execute(...args));
	}
}

client.login(process.env.DISCORD_TOKEN);