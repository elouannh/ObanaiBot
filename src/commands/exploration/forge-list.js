const Command = require("../../base/Command");
const convertDate = require("../../utils/convertDate");

class ForgeList extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["forge-list", "fl"],
            args: [],
            category: "Exploration",
            cooldown: 10,
            description: "Commande permettant de voir les objets en train d'être forgé.",
            examples: ["forge-list"],
            finishRequest: "ADVENTURE",
            name: "forge-list",
            ownerOnly: false,
            permissions: 0,
            syntax: "forge-list",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const aDatas = await this.client.activityDb.get(this.message.author.id);

        let activity = "";
        const items = {};
        const dates = {};

        for (const i in aDatas.isForging) {
            if (aDatas.isForging[i]) {
                const dat = aDatas.forging[i];
                items[i] = dat;
                let str = `**${Number(i) + 1}.** `;
                if (dat.itemCat === "weapon") str += `Fabrication d'une arme: **${dat.itemName}** (rareté **${dat.itemRarity}**)`;
                str += `\n> *Fin dans: ${convertDate((dat.start + dat.duration) - Date.now()).string}*`;
                if ((dat.start + dat.duration) - Date.now() <= 0) dates[i] = true;
                else dates[i] = false;
                activity += `\n\n${str}`;
            }
        }

        if (Object.values(dates).includes(true)) {
            activity += "\n\nCertains objets sont prêts à la récupération ! "
                        +
                        "Vous pouvez obtenir le produit de forge avec la commande !forge-collect.";
        }

        if (Object.entries(items).length === 0) activity = "Aucun objet n'est en train d'être forgé.";
        if (Object.entries(items).length !== 3) activity += `\n\n... ${3 - Object.entries(items).length} emplacements libres restant.`;

        await this.ctx.reply("Forge.", activity, "⚒️", null, "outline");
    }
}

module.exports = ForgeList;