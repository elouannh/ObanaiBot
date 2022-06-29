const Command = require("../../base/Command");

class ForgeCollect extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["forge-collect", "fc"],
            args: [],
            category: "Exploration",
            cooldown: 10,
            description: "Commande permettant de récupérer les objets forgés prêts.",
            examples: ["forge-collect"],
            finishRequest: "ADVENTURE",
            name: "forge-collect",
            ownerOnly: false,
            permissions: 0,
            syntax: "forge-collect",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const aDatas = await this.client.activityDb.get(this.message.author.id);
        const iDatas = await this.client.inventoryDb.get(this.message.author.id);
        const existingWeapons = "weapons" in iDatas ? iDatas.weapons : [];

        const items = {};
        const dates = {};

        for (const i in aDatas.isForging) {
            if (aDatas.isForging[i]) {
                const dat = aDatas.forging[i];
                items[i] = dat;
                if ((dat.start + dat.duration) - Date.now() <= 0) dates[i] = true;
                else dates[i] = false;
            }
        }

        if ((Object.values(dates).filter(d => d === true).length + existingWeapons.length) > 10) {
            return await this.ctx.reply(
                "Oups...",
                "Vous ne pouvez pas récupérer les objets qui sont forgés. Votre inventaire d'arme est plein. Veuillez vendre des armes avec la commande !weapon-sell.",
                null,
                null,
                "warning",
            );
        }

        if (Object.values(dates).includes(true)) {
            let collected = "\n\nVoici les objets récupérés:\n```diff";
            let i = 0;
            const newIsForging = aDatas.isForging;
            const newForging = aDatas.forging;

            for (const elt of Object.values(items)) {
                if ((elt.start + elt.duration) - Date.now() <= 0) {
                    const d = {
                        rarity: elt.itemRarity,
                        name: elt.itemName,
                        label: elt.itemLabel,
                    };

                    existingWeapons.push(d);

                    newIsForging[i] = false;
                    newForging[i] = null;
                    collected += `\n+ ${elt.itemName} (${elt.itemLabel}), rareté: ${elt.itemRarity}`;
                }
                i++;
            }

            await this.client.inventoryDb.db.set(this.message.author.id, existingWeapons, "weapons");
            collected += "```";
            await this.client.activityDb.db.set(this.message.author.id, newIsForging, "isForging");
            await this.client.activityDb.db.set(this.message.author.id, newForging, "forging");

            await this.ctx.reply("Forge.", collected, "⚒️", null, "outline");
        }
        else {
            return await this.ctx.reply("Forge.", "Vous n'avez aucun objet à récupérer.", "⚒️", null, "outline");
        }
    }
}

module.exports = new ForgeCollect();