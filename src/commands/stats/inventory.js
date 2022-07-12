const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");
const intRender = require("../../utils/intRender");

class Inventory extends Command {
    constructor() {
        super({
            aliases: ["inventory", "i", "inv"],
            args: [["player", "joueur dont vous souhaitez voir l'invetaire de jeu. (ou vous)", false]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir son inventaire de pourfendeur.",
            examples: ["[p]inventory @pandawou"],
            finishRequest: "ADVENTURE",
            name: "inventory",
            private: "none",
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
        const title = `Inventaire de ${user.username}`;
        let inventory = "";

        inventory += `Yens: **${intRender(pDatas.yens, " ")}¥**\n`;

        let st = "";
        if (Object.values(pDatas.materials).length > 0) {
            for (const key in pDatas.materials) {
                const gr = require(`../../elements/materials/${key}.json`);
                st += `${gr.emoji} ${gr.name}: x${"materials" in pDatas ? (key in pDatas.materials ? pDatas.materials[key] : 0) : 0}\n`;
            }
        }
        else {
            st = "Inventaire vite.";
        }
        inventory += `\n**Matières premières**\n\`\`\`${st}\`\`\``;
        await this.ctx.reply(title, inventory, "🎒", "2f3136", null);
    }
}

module.exports = Inventory;