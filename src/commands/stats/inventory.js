const Command = require("../../base/Command");
const calcCrowLevel = require("../../elements/calcCrowLevel");
const MemberScanning = require("../../structure/tools/MemberScanning");
const convertDate = require("../../utils/convertDate");

class Inventory extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["inventory", "i", "inv"],
            args: [["player", "joueur dont vous souhaitez voir l'invetaire de jeu. (ou vous)", false]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir son inventaire de pourfendeur.",
            examples: ["inventory @pandawou"],
            finishRequest: "ADVENTURE",
            name: "inventory",
            ownerOnly: false,
            permissions: 0,
            syntax: "inventory <?player>",
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
        const title = `Inventaire de ${user.username}`;
        let inventory = "";

        const grim = pDatas.active_grimoire === null ? null : require(`../../elements/grimoires/${pDatas.active_grimoire}.json`);

        inventory += `> Porte-feuille: **${pDatas.yens}¥**`;

        if (grim !== null) {
            const timeLeft = (grim.expiration * 1000) - (Date.now() - pDatas.active_grimoire_since);
            inventory += `\n\n> Grimoire: **${grim.name}** | Durée restante: **${convertDate(timeLeft, false).string}**`;
            inventory += `\nBénéfices:\n\`\`\`${grim.benefits.map(e => `- ${grims_boost[e].replace("[b]", ((grim.boost - 1) * 100).toFixed(0))}`).join("\n")}\`\`\``;
        }
        else {
            inventory += "\n\n> Grimoire: **Pas de grimoire actif.**";
        }

        if (Object.values(pDatas.grimoires).length === 0) {
            inventory += "\nStock: **Pas de grimoire en stock.**";
        }
        else {
            let st = "";
            for (const key in pDatas.grimoires) {
                const gr = require(`../../elements/grimoires/${key}.json`);
                st += `${gr.name}: x${pDatas.grimoires[key]}\n`;
            }
            inventory += `\nStock:\n\`\`\`${st}\`\`\``;
        }


        let st = "";
        if (Object.values(pDatas.materials).length > 0) {
            for (const key in pDatas.materials) {
                const gr = require(`../../elements/materials/${key}.json`);
                st += `${gr.name}: x${"materials" in pDatas ? (key in pDatas.materials ? pDatas.materials[key] : 0) : 0}\n`;
            }
        }
        else {
            st = "Inventaire vite.";
        }
        inventory += `\n\n> Matières premières:\n\`\`\`${st}\`\`\``;
        await this.ctx.reply(title, inventory, "🎒", "2f3136", null);
    }
}

module.exports = new Inventory();