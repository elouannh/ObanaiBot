const Command = require("../../base/Command");
const convertDate = require("../../utils/convertDate");
const DiscordStatus = require("discord.js").Status;

class Status extends Command {
    constructor() {
        super({
            aliases: ["status"],
            args: [],
            category: "Testing",
            cooldown: 7,
            description: "Commande permettant de voir le statut du bot en temps réel.",
            examples: ["[p]status"],
            finishRequest: "ADVENTURE",
            name: "status",
            private: "none",
            permissions: 0,
            syntax: "status",
        });
    }

    async run() {
        const internalServer = await this.client.internalServerManager;
        const statusDb = await this.client.statusDb;

        const processus = {
            "server1": internalServer.processing[0].filter(e => e === true).length * 100 / internalServer.processing[0].length,
            "server2": internalServer.processing[1].filter(e => e === true).length * 100 / internalServer.processing[1].length,
        };
        const ready = {
            "server1": { "0": "🔴 offline", "1": "🟡 preparing", "2": "🟢 online" }[internalServer.readyOrNot[0]],
            "server2": { "0": "🔴 offline", "1": "🟡 preparing", "2": "🟢 online" }[internalServer.readyOrNot[1]],
        };

        function processStrings(percent) {
            const identifiers = {
                "0": "🟣 <10%",
                "10": "🔵 <25%",
                "25": "🟢 <50%",
                "50": "🟡 <60%",
                "60": "🟠 <80%",
                "80": "🔴 >80%",
            };

            return Object.entries(identifiers).filter(e => percent >= Number(e[0])).at(-1)[1];
        }

        function statusString(name) {
            const identifiers = {
                "online": "🟢 online",
                "disabled": "🔴 unavailable",
                "maintenance": "🟡 maintenance",
            };

            return identifiers[name];
        }

        function pingString(amount) {
            const identifiers = {
                "50": "🟣",
                "100": "🔵",
                "150": "🟢",
                "200": "🟡",
                "400": "🟠",
                "600": "🔴",
            };

            return Object.entries(identifiers).filter(e => amount >= Number(e[0])).at(-1)[1] + ` ${amount} ms`;
        }

        // DISCORD API STATUS
        let datas = "> 🔨 ***Discord API***\n\n";
        datas += `\`ping\`: **\`${pingString(this.client.ws.ping)}\`**\n`;
        datas += `\`api status\`: **\`${DiscordStatus[this.client.ws.status]}\`**\n\n`;

        // INTERNAL SERVER STATUS
        datas += "> ⚗️ ***Obanai's Internal Server***\n\n";
        datas += "**Server 1 [launcher]**\n";
        datas += `\`status\`: **\`${ready["server1"]}\`**\n`;
        datas += `\`process\`: **\`${processStrings(processus["server1"])}\`**\n`;

        datas += "**Server 2 [mod]**\n";
        datas += `\`status\`: **\`${ready["server2"]}\`**\n`;
        datas += `\`process\`: **\`${processStrings(processus["server2"])}\`**\n\n`;

        // RPG STATUS
        datas += "> 🌍 ***Obanai's RPG Server***\n\n";
        datas += `\`status\`: **\`${statusString(statusDb.datas.mode)}\`**\n`;
        datas += "**Process**\n";
        const memoryUsage = process.memoryUsage().heapTotal / 1024 / 1024;
        const ramPercent = Math.ceil(memoryUsage * 100 / (4.00 * 1024));
        datas += `\`memory usage\`: **\`${((memoryUsage).toFixed(4))} MB\`**/\`${(4.00 * 1024).toFixed(0)} MB\` \`(${ramPercent}%)\`\n`;
        datas += `\`process\`: **\`${processStrings(ramPercent)}\`**\n`;
        datas += `\`uptime\`: **\`${convertDate(process.uptime() * 1000, true).string}\`**`;

        await this.ctx.reply("Statut du processus Obanai", datas, "🖥️", null, "info");
    }
}

module.exports = Status;