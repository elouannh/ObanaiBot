const Command = require("../../base/Command");
const convertDate = require("../../utils/convertDate");

class ForgeWeapon extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["forge-weapon", "fw"],
            args: [],
            category: "Exploration",
            cooldown: 5,
            description: "Commande permettant de forger des armes.",
            examples: ["forge-weapon"],
            finishRequest: "ADVENTURE",
            name: "forge-weapon",
            ownerOnly: false,
            permissions: 0,
            syntax: "forge-weapon",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        function luck(count = 0) {
            if ((Math.random() * 100) < (100 / (count + 1)) && count < 5) return luck(count + 1);
            return count;
        }

        const aDatas = await this.client.activityDb.get(this.message.author.id);
        const iDatas = await this.client.inventoryDb.get(this.message.author.id);
        const pDatas = await this.client.playerDb.get(this.message.author.id);
        const items = {};

        for (const i in aDatas.isForging) {
            if (aDatas.isForging[i]) {
                items[i] = aDatas.forging[i];
            }
        }

        if (Object.entries(items).length >= 3) return await this.ctx.reply("forger des armes", "vous avez atteint le nombre d'items maximum possible en forge.", null, null, "error");
        const weaponModels = "materials" in iDatas ? ("weapon_model" in iDatas.materials ? iDatas.materials["weapon_model"] : 0) : 0;
        const tamahagane = "materials" in iDatas ? ("tamahagane" in iDatas.materials ? iDatas.materials["weapon_model"] : 0) : 0;
        const woodLogs = "materials" in iDatas ? ("wood" in iDatas.materials ? iDatas.materials["weapon_model"] : 0) : 0;
        const yens = iDatas.yens ?? 0;

        const msg = await this.ctx.reply("voulez vous forger une arme", "souhaitez-vous vraiment forger une arme ? Cela compte 20 planches, 1 modèle d'arme, 100 tamahagane et 100 000 yens.", null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["✅", "❌"]);
        if (choice === "❌") {
            return await this.ctx.reply("forger une arme", "Vous avez décidé de ne pas forger.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("forger une arme", "La commande n'a pas aboutie.", null, null, "timeout");
        }
        else if (choice === "✅") {
            const objects = {
                "weapon_model": [weaponModels, 1],
                "tamahagane": [tamahagane, 100],
                "wood": [woodLogs, 20],
                "yens": [yens, 100000],
            };
            const missing = {};
            for (const item in objects) {
                const i = objects[item];
                if (i[0] < i[1]) missing[item] = [i[0], i[1], i[1] - i[0]];
            }
            if (Object.values(missing).length !== 0) return await this.ctx.reply("forger une arme", "Vous n'avez pas les éléments nécessaires.", null, null, "timeout");
            await this.ctx.reply("forger une arme", "Vous forgez donc une arme.", null, null, "timeout");
            const rarity = luck();
            const itemFile = require(`../../elements/categories/${pDatas.category}.json`);
            const itemDat = {
                type: "weapon",
                rarity: rarity,
                datas: {
                    name: `${itemFile.weaponName} ${itemFile.rarityNames[rarity]}`,
                    weapon: `${itemFile.weapon}`,
                },
            };
            await this.client.activityDb.forgeItem(this.message.author.id, itemDat);
        }
    }
}

module.exports = new ForgeWeapon();