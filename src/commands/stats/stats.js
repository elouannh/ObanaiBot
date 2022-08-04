const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class Stats extends Command {
    constructor() {
        super({
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir ses stats de pourfendeur.",
            finishRequest: "ADVENTURE",
            name: "stats",
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;

        const pExists = await this.client.playerDb.started(user.id);
        if (!pExists) {
            return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");
        }

        const pDatas = await this.client.playerDb.get(user.id);
        const emojis = { "agility":"🤸‍♂️", "defense":"🛡️", "strength":"👊", "speed": "⚡" };

        let stats = "";

        const category = require(`../../elements/categories/${pDatas.category}.json`);
        const breath = require(`../../elements/breaths/${pDatas.breath}_style.json`);

        stats += "**Aptitudes**\n";
        stats += `\`\`\`🤸‍♂️ Agilité: ${pDatas.aptitudes.agility} • Niveau ${pDatas.stats.agility}\n`;
        stats += `🛡️ Défense: ${pDatas.aptitudes.defense} • Niveau ${pDatas.stats.defense}`;
        stats += `\n👊 Force: ${pDatas.aptitudes.strength} • Niveau ${pDatas.stats.strength}\n`;
        stats += `⚡ Vitesse: ${pDatas.aptitudes.speed} • Niveau ${pDatas.stats.speed}\`\`\``;

        const effects = i => {
            return Math.round(
                Math.sqrt((((i === 0 ? 1 : -1) + pDatas.categoryLevel / (i === 0 ? 20 : 50)) * 100) ** 2),
            );
        };

        stats += `\n**Catégorie**: ${category.name} • Niveau **${pDatas.categoryLevel}**`;
        stats += `\n*Effets:*\n\`\`\`${
            category.bonus.map((e, i) => `${emojis[e]} ${effects(i)}%`)
                          .join("\n")
        }\`\`\``;

        stats += `\n**Souffle**: ${breath.emoji} ${breath.name}`;

        await this.ctx.reply(`Statistiques de ${user.username}`, stats, "👘", null, "outline");
    }
}

module.exports = Stats;