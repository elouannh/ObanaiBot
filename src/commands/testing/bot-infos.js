const Command = require("../../base/Command");
const { escapeMarkdown } = require("discord.js");

class BotInfos extends Command {
    constructor() {
        super({
            category: "Testing",
            cooldown: 7,
            description: "Commande permettant de voir les informations du bot.",
            finishRequest: ["Testing"],
            name: "bot-infos",
            private: "testers",
            permissions: 0n,
        });
    }

    async run() {
        let botinfos = "> 📦 ***Databases sizes***\n\n";
        botinfos += `\`players\`: **\`${
            this.client.playerDb.db.array().filter(e => e.started === true).length
        } entries\`**\n`;
        botinfos += `\`users\`: **\`${this.client.users.cache.size} entries\`**\n`;
        botinfos += `\`servers\`: **\`${this.client.guilds.cache.size} entries\`**\n\n`;

        botinfos += "> ❗ ***Last entries***\n\n";
        botinfos += `**Last 5 Servers**\n${
            this.client.guilds.cache
                .map(e => [e.name, e.joinedTimestamp])
                .sort((a, b) => b[1] - a[1])
                .splice(0, 5)
                .map(e => `**\`${e[0]}\` - <t:${((e[1]) / 1000).toFixed(0)}:R>**`)
                .join("\n")
        }\n`;
        botinfos += `\n**Last 5 Players**\n${
            this.client.playerDb.db.array()
                .filter(e => e.started === true)
                .sort((a, b) => b.created - a.created)
                .splice(0, 5)
                .map(e => `**\`${
                    escapeMarkdown(this.client.users.fetch(e.id)?.username ?? "non-cached player")
                }\` - <t:${((e.created) / 1000).toFixed(0)}:R>**`)
                .join("\n")
        }\n`;


        await this.ctx.reply("Informations du bot Obanai", botinfos, "📊", null, "info");
    }
}

module.exports = BotInfos;