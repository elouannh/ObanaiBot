const Command = require("../../base/Command");
const intRender = require("../../utils/intRender");

class Top extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["top", "lb"],
            args: [],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir le classement des meilleurs joueurs.",
            examples: ["top"],
            finishRequest: "ADVENTURE",
            name: "top",
            ownerOnly: false,
            permissions: 0,
            syntax: "top",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous avez déjà commencé votre aventure.", null, null, "error");

        const players = this.client.playerDb.db.array();
        console.log(players);
        const topPlayers = players.sort((a, b) => b.exp - a.exp);
        console.log(topPlayers);
        let lb = `Votre rang: **#${topPlayers.length > 0 ? topPlayers.map(e => e.id).indexOf(this.message.author.id) + 1 : "Non classé"}**\n\n`;

        let i = 0;
        for (const player of topPlayers.splice(0, 20)) {
            lb += `\`#${i + 1}\` ¦ ${this.client.users.cache.get(player.id)?.username ?? "Pourfendeur X"} ¦ **${intRender(player.exp, " ")}** :star:\n`;
            i++;
        }

        return await this.ctx.reply("Classement.", lb, "📊", null, "outline");


    }
}

module.exports = Top;