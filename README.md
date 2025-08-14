# BiggieBot

A fun Discord bot built by CS C&C with [discord.js](https://discord.js.org/).
**THIS BOT IS BIG!!!!!!!! #MakeAmericaBigAgain**

## ✨ Features

### Commands

- `/counting set` - Sets the current channel as the counting channel (Admin only)
- `/dailyquestion set` - Sets the current channel for daily questions (Admin only)  
- `/buzzword add keyword/phrase, response` - Adds a new buzzword and response (limit: 2 per user)  
- `/buzzword remove keyword/phrase` - Removes a buzzword you've created  
- `/buzzword list` - Lists all buzzwords and their responses  
- And more!

### Automated Features

- **Daily Questions** – Posts a random question every day  
- **Buzzword Responses** – Responds to specific keywords in messages  
- **Counting Channel** – Maintains a channel where users count sequentially  

## Developer Setup
### Requirements
- Node.js
- MongoDB
  - Either MongoDB, MongoDB Atlas, or a Docker/Podman container running MongoDB

### Download Dependencies
```sh
npm install
```

### Set Environment Variables
- Create .env file
- Fill out the following fields:
```
DISCORD_TOKEN=
MONGODB_URL=
```

### Run Bot for Development with Hot-Reloading
```sh
npm run dev
```

### Build Bot for Production
```sh
npm run build
```

### Run Production Ready Bot
```sh
npm run start
```

## 📁 Project Structure

```
dist/           # Transpiled TypeScript
src/            # Application Source Code
src/commands/   # Command Files
src/events/     # Event Files
src/utils/      # Utility Functions (Not directly registered by the bot)
src/index.ts    # Main entrypoint
```

## 🧩 Adding New Event Listeners

Create a file `yourEvent.ts`/`yourEvent.js` in the `src/events/` folder:

```ts

// For an event that fires multiple times
export const on = Events.*;

// For event that fires once; only set one or the other
export const once = Events.*;

export async function execute(args...) {
  //Event logic
}
```

## 💬 Adding Commands

Create a file `yourcommand.ts`/`yourcommand.js` in the `src/commands/` folder:

```ts
export const command = new SlashCommandBuilder()
    .setName('yourcommand')
    .setDescription('Command description')
    // Any other options

export async function execute(interaction: ChatInputCommandInteraction) {
    await/return interaction.reply('Command response');
};
```

> The bot will update all commands and features on reload.
> Currently running on Ben's server via Docker. New images are generated for each push.

---

## 📜 Legal

- [Privacy Policy](PRIVACY_POLICY.md)  
- [Terms of Service](TERMS_OF_SERVICE.md)
