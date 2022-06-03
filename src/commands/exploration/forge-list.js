const Command = require("../../base/Command");
const convertDate = require("../../utils/convertDate");

class ForgeList extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["forge-list", "fl"],
            args: [],
            category: "Exploration",
            cooldown: 5,
            description: "Commande permettant de voir les objets en train de se faire forger.",
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
        const iDatas = await this.client.playerDb.get(this.message.author.id);

        let activity = "";
        activity += "**Objets en forge**";
        const items = {};

        for (const i in aDatas.isForging) {
            if (aDatas.isForging[i]) {
                const dat = aDatas.forging[i];
                items[i] = dat;
                let str = `\`${Number(i) + 1}: Emplacement occupé\``;
                if (dat.itemCat === "weapon") str += `\nFabrication d'une arme:\n${dat.itemDatas.name} (rareté **${dat.itemRarity}**)`;
                if (dat.itemCat === "tool") str += `\nFabrication d'un outil:\n${dat.itemDatas.name} (rareté **${dat.itemRarity}**)`;
                str += `\n> **Fin dans: ${convertDate((dat.start + dat.duration) - Date.now()).string}**`;
                activity += `\n\n${str}`;
            }
            else {
                const str = `\`${Number(i) + 1}: Emplacement libre\``;
                activity += `\n\n${str}`;
            }
        }

        const msg = await this.ctx.reply("forge", activity, null, null, "info");
        if (Object.entries(items).length === 0) return;
        const choice = await this.ctx.reactionCollection(msg, ["🛄", "❌"]);

        if (choice === "❌") {
            return await this.ctx.reply("récupérer objets en forge", "Vous avez décidé de ne pas récupérer vos objets en forge.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("récupérer objets en forge", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }
        else if (choice === "🛄") {
            await this.ctx.reply("récupérer objets en forge", "Vous récupérez donc les objets en forge.", null, null, "timeout");

            for (const item of Object.values(items)) {
                const itemQuantity = `${item.itemCat}s` in iDatas ? (item.itemLabel in iDatas[`${item.itemCat}s`] ? iDatas[`${item.itemCat}s`][item.itemLabel] : []) : [];
                itemQuantity.push({ rarity: item.itemRarity, name: item.name, datas: item.itemDatas });
                await this.client.inventoryDb.db.set(this.message.author.id, itemQuantity, `${item}s`);
            }
        }
    }
}

module.exports = new ForgeList();