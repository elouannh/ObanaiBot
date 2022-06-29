const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");
const convertDate = require("../../utils/convertDate");

class Grimoires extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["grimoires", "gr"],
            args: [["player", "joueur dont vous souhaitez voir les grimoires. (ou vous)", false]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir ses grimoires.",
            examples: ["grimoires @pandawou"],
            finishRequest: "ADVENTURE",
            name: "grimoires",
            ownerOnly: false,
            permissions: 0,
            syntax: "grimoires <?player>",
        });
    }

    async run() {
        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;

        const pExists = await this.client.playerDb.started(user.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.inventoryDb.get(user.id);
        const grims_boost = {
            "experience_gain": "+[b]%⭐",
            "yens_gain": "+[b]%💰",
            "kasugai_crows_rarity_boost": "+[b]%🐦 rareté",
            "loot_rate_boost": "+[b]%🧰 rareté",
            "stats_boost": "+[b]%👑 stats",
            "travelling_time": "-[b]%🕣 voyage",
            "training_time": "-[b]%🕣 entrainement",
        };
        let grimoires = "";
        const grim = pDatas.active_grimoire === null ? null : require(`../../elements/grimoires/${pDatas.active_grimoire}.json`);

        if (grim !== null) {
            const timeLeft = (grim.expiration * 1000) - (Date.now() - pDatas.active_grimoire_since);
            grimoires += `Grimoire: **${grim.name}** • Durée restante: **${convertDate(timeLeft, false).string}**\n`;
            grimoires += `*Effets:*\n\`\`\`${grim.benefits.map(e => `${grims_boost[e].replace("[b]", ((grim.boost - 1) * 100).toFixed(0))}`).join("\n")}\`\`\``;
        }
        else {
            grimoires += "```Aucun grimoire actif.```";
        }

        if (Object.values(pDatas.grimoires).length === 0) {
            grimoires += "\nStock: **Pas de grimoire en stock.**";
        }
        else {
            let st = "";
            for (const key in pDatas.grimoires) {
                const gr = require(`../../elements/grimoires/${key}.json`);
                st += `${gr.name}: x${pDatas.grimoires[key]}\n`;
            }
            grimoires += `\nStock:\n\`\`\`${st}\`\`\``;
        }

        await this.ctx.reply(`Grimoires de ${user.username}`, grimoires, "📖", null, "outline");
    }
}

module.exports = new Grimoires();