const Command = require("../../base/Command");
const convertDate = require("../../utils/convertDate");

class ForgeWeapon extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["forge-weapon", "fw"],
            args: [],
            category: "Exploration",
            cooldown: 30,
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

        function luck(x, count = 0) {
            if (((Math.random() * 100) / x) < (100 / (count + 1)) && count < 5) return luck(x, count + 1);
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

        if (Object.entries(items).length >= 3) return await this.ctx.reply("Oups...", "Vous avez atteint le nombre d'items maximum possible en forge. (3)", null, null, "warning");
        const weaponModels = "materials" in iDatas ? ("weapon_model" in iDatas.materials ? iDatas.materials["weapon_model"] : 0) : 0;
        const tamahagane = "materials" in iDatas ? ("tamahagane" in iDatas.materials ? iDatas.materials["tamahagane"] : 0) : 0;
        const woodLogs = "materials" in iDatas ? ("wood" in iDatas.materials ? iDatas.materials["wood"] : 0) : 0;
        const yens = iDatas.yens ?? 0;

        const msg = await this.ctx.reply(
            "Forger une arme.",
            "Souhaitez-vous vraiment forger une arme ? Vous aurez une arme de rareté aléatoire. (PS: vos chances sont accrues si vous vous trouvez au **Village des forgerons**)\n"
            +
            "\n__Matériaux :__\n```diff\n- x1 Modèle d'arme\n- x100 Tamahagane\n- x20 Bois\n- 100'000 ¥```\n\nRépondre avec `y` (oui) ou `n` (non).",
            "🗡️",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        if (this.ctx.isResp(choice, "y")) {
            const objects = {
                "weapon_model": [weaponModels, 1],
                "tamahagane": [tamahagane, 100],
                "wood": [woodLogs, 20],
                "yens": [yens, 50000],
            };
            const missing = {};
            for (const item in objects) {
                const i = objects[item];
                if (i[0] < i[1]) missing[item] = [i[0], i[1], i[1] - i[0]];
            }
            if (Object.values(missing).length !== 0) return await this.ctx.reply("Oups...", "Vous n'avez pas les éléments nécessaires.", null, null, "warning");
            const rarity = luck((this.client.mapDb.db.get(this.message.author.id).region === 7 ? 3 : 1));
            await this.ctx.reply(
                "Forger une arme.", `Vous forgez donc une arme !\n\n**Détails de l'arme:**\nTemps de forge: **${convertDate(7_200_000 * rarity).string}**\n`
                +
                `Rareté: **${rarity}**\n*Plus d'informations avec la commande !forge-list.*`,
                "🗡️",
                null,
                "outline",
            );
            const itemFile = require(`../../elements/categories/${pDatas.category}.json`);
            const itemDat = {
                type: "weapon",
                rarity: rarity,
                datas: {
                    name: `${itemFile.weaponName} ${itemFile.rarityNames[rarity - 1]}`,
                    weapon: `${itemFile.weapon}`,
                },
            };
            await this.client.activityDb.forgeItem(this.message.author.id, itemDat);
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Forger une arme.", "Vous avez décidé de ne pas forger.", "🗡️", null, "outline");
        }
        else {
            return await this.ctx.reply("Forger une arme.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = ForgeWeapon;