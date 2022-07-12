const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class Stats extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["stats", "s"],
            args: [["player", "joueur dont vous souhaitez voir les stats de jeu. (ou vous)", false]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir ses stats de pourfendeur.",
            examples: ["[p]stats @pandawou"],
            finishRequest: "ADVENTURE",
            name: "stats",
            ownerOnly: false,
            permissions: 0,
            syntax: "stats <?player>",
        });
    }

    async run() {
        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;

        const pExists = await this.client.playerDb.started(user.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.playerDb.get(user.id);
        const emojis = { "agility":"🤸‍♂️", "defense":"🛡️", "force":"👊", "speed": "⚡" };

        let stats = "";

        const category = require(`../../elements/categories/${pDatas.category}.json`);
        const breath = require(`../../elements/breaths/${pDatas.breath}_style.json`);

        stats += "**Aptitudes**\n";
        stats += `\`\`\`🤸‍♂️ Agilité: ${pDatas.aptitudes.agility} • Niveau ${pDatas.stats.agility}\n🛡️ Défense: ${pDatas.aptitudes.defense} • Niveau ${pDatas.stats.defense}`;
        stats += `\n👊 Force: ${pDatas.aptitudes.force} • Niveau ${pDatas.stats.force}\n⚡ Vitesse: ${pDatas.aptitudes.speed} • Niveau ${pDatas.stats.speed}\`\`\``;

        stats += `\n**Catégorie**: ${category.name} • Niveau **${pDatas.categoryLevel}**`;
        stats += `\n*Effets:*\n\`\`\`${
            category.bonus.map((e, i) => `${emojis[e]} ${Math.round(Math.sqrt((((i === 0 ? 1 : -1) + pDatas.categoryLevel / (i === 0 ? 20 : 50)) * 100) ** 2))}%`).join("\n")
        }\`\`\``;

        stats += `\n**Souffle**: ${breath.emoji} ${breath.name}`;

        await this.ctx.reply(`Statistiques de ${user.username}`, stats, "👘", null, "outline");
    }
}

module.exports = Stats;