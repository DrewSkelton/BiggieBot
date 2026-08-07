# BiggieBot

A fun Discord bot built by CS C&C with [discord.js](https://discord.js.org/).
**THIS BOT IS BIG!!!!!!!! #MakeAmericaBigAgain**

## Features

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

### Download Dependencies
```sh
npm install
```

### Set Environment Variables
- Create .env file
- Fill out the following fields:
```
DISCORD_TOKEN=
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

## Project Structure

```
dist/           # Transpiled TypeScript
src/            # Application Source Code
src/features/   # Discord bot features
src/util/       # Functions which don't belong to a single feature
src/main.ts     # Main entrypoint
src/shared.ts   # Database, event registers, and other utilities
```

### Adding New Features

Refer to [src/features/example] for an example on how to write features.

> The bot will update all commands and features on reload.
> Currently running on Ben's server via Docker. New images are generated for each push.

---

## Legal

- [Privacy Policy](PRIVACY_POLICY.md)
- [Terms of Service](TERMS_OF_SERVICE.md)
