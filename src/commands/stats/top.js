const Command = require("../../base/Command");

class Top extends Command {
    constructor() {
        super({
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir le classement des meilleurs joueurs.",
            finishRequest: "ADVENTURE",
            name: "top",
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) {
            return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");
        }

        const players = this.client.playerDb.db.array().filter(async p => await this.client.playerDb.started(p.id));
        const topPlayers = players.sort((a, b) => b.exp - a.exp);
        const userRank = topPlayers.length > 0 ?
                         topPlayers.map(e => e.id).indexOf(this.message.author.id) + 1
                         : "Non classé";
        let lb = `Votre rang: **#${userRank}**\n\n`;

        let i = 0;
        for (const player of topPlayers.splice(0, 20)) {
            lb += `\`#${i + 1}\` ¦ ${this.client.users.fetch(player.id)?.username ?? "Pourfendeur X"}`;
            lb += ` ¦ **${this.client.util.intRender(player.exp, " ")}** :star:\n`;
            i++;
        }

        return await this.ctx.reply("Classement.", lb, "📊", null, "outline");


    }
}

module.exports = Top;