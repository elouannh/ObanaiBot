# ObanaiBot - Become the slayer you always dreamed of being

ObanaiBot is a Discord Bot coded in JavaScript using the runtime NodeJS. This bot is a RPG bot that allows you to become the slayer you always dreamed of being. You can fight monsters, level up, and become the best slayer in the world.

# Version Control

## 1. Installing the repository

Follow one of the following steps to install the repository:

### Cloning the repository

```bash
git clone https://github.com/ObanaiDiscordBot/ObanaiBot.git/tree/main
```

### Forking in your personal branch

```bash
git clone https://github.com/YourUsername/ObanaiBot.git/tree/main
```

## 2. Installing the dependencies

*We suggest you to use the main branch because this is the most advanced version of the project.*

```bash
npm install
```

## 3. Adding the token.json file

For the bot to work, you need to add a token.json file in the root of the project. This file contains the token of your bot. You can get it from the [Discord Developer Portal](https://discord.com/developers/applications).

```json
{
    "token": "YourTokenHere"
}
```

## 4. Running the bot

```bash
npm run bot
```

You can add the following parameters to the command:
```
registerSlash - Register the slash commands
renderTranslations - Render the translations and permit you to see if the translation file is correct
mergeSQLiteTables - Merge the old SQLiteTables structure into the new one
```
