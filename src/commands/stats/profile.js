const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");
const calcPlayerLevel = require("../../elements/calcPlayerLevel");

class Profile extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["profile", "profil", "p"],
            args: [["player", "joueur dont vous souhaitez voir le profil de jeu. (ou vous)", false]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir son profil de pourfendeur.",
            examples: ["profile @pandawou"],
            finishRequest: "ADVENTURE",
            name: "profile",
            ownerOnly: false,
            permissions: 0,
            syntax: "profile <?player>",
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
        const flag = { "fr":":flag_fr:", "en":":flag_gb:", "es":"flag_es:", "uk": ":flag_ua:", "de": ":flag_de:" };
        const emojis = { "agility":"🤸‍♂️", "defense":"🛡️", "force":"👊", "speed": "⚡" };

        const title = `${user.username} | ${pDatas.exp} ⭐`;
        let profile = "";

        const category = require(`../../elements/categories/${pDatas.category}.json`);
        const breath = require(`../../elements/breaths/${pDatas.breath}_style.json`);
        const weapon = pDatas.weapon.name;
        const playerLevel = calcPlayerLevel(pDatas.exp);

        const percent = Math.floor(playerLevel.tempExp * 20 / playerLevel.required);
        profile += `> Niveau: **${playerLevel.level}** \`[${"#".repeat(percent)}${"-".repeat(20 - percent)}]\` > **${playerLevel.nextLevel}**`;

        profile += `\n\n> Aptitudes\nt🤸‍♂️**${pDatas.aptitudes.agility}** (lvl. ${pDatas.stats.agility}) - 🛡️**${pDatas.aptitudes.defense}** (lvl. ${pDatas.stats.defense}) - 👊**${pDatas.aptitudes.force}** (lvl. ${pDatas.stats.force}) - ⚡**${pDatas.aptitudes.speed}** (lvl. ${pDatas.stats.speed})`;

        profile += `\n\n> Catégorie: **${category.name}** | niveau **${pDatas.categoryLevel}**`;
        profile += `\nEffets: ${category.bonus.map((e, i) => `${emojis[e]}**${Math.round(Math.sqrt((((i === 0 ? 1 : -1) + pDatas.categoryLevel / 20) * 100) ** 2))}%**`).join(" | ")}`;
        profile += `\nArme: **${weapon}** | Rareté: ${"💎".repeat(pDatas.weapon.rarity)}${"⚫".repeat(5 - pDatas.weapon.rarity)}`;

        profile += `\n\n> Souffle: ${breath.emoji}**${breath.name}**`;

        if (pDatas.squad === null) {
            profile += "\n\n> Escouade: **Pas d'escouade**";
        }
        else {
        const sDatas = pDatas.squad;
        profile += `\n\n> Escouade: **${sDatas.name}**`;
        }

        await this.ctx.reply(title, profile, flag[pDatas.lang], "2f3136", null);
    }
}

module.exports = new Profile();