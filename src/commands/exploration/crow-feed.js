const Command = require("../../base/Command");
const calcCrowLevel = require("../../elements/calcCrowLevel");

class CrowFeed extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["crow-feed", "cf"],
            args: [],
            category: "Exploration",
            cooldown: 5,
            description: "Commande permettant de nourrir votre corbeau de liaison afin d'augmenter les bonus qu'il vous octroie.",
            examples: ["crow-feed"],
            finishRequest: "ADVENTURE",
            name: "crow-feed",
            ownerOnly: false,
            permissions: 0,
            syntax: "crow-feed",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const iDatas = await this.client.inventoryDb.get(this.message.author.id);
        if (iDatas.kasugai_crow === null) return await this.ctx.reply("Oups...", "Vous n'avez pas de oiseau à nourrir !", null, null, "warning");
        if (iDatas.kasugai_crow_exp >= 33250) return await this.ctx.reply("Oups...", "Votre oiseau a atteint le niveau max possible ! (15)", null, null, "warning");

        const seeds = "materials" in iDatas ? ("seed" in iDatas.materials ? iDatas.materials.seed : 0) : 0;
        const worms = "materials" in iDatas ? ("worm" in iDatas.materials ? iDatas.materials.worm : 0) : 0;

        const msg = await this.ctx.reply(
            "Nourrir votre oiseau.",
            `**Quantités de nourriture:**\n• \`[seed]\` Graine(s): x**${seeds}**\n• \`[worm]\` Ver(s) de terre: x**${worms}**\n\nVeuillez sélectionner le type de nourriture `
            +
            "ainsi que sa quantité ci-dessous.\n```Exemple:\n!crow-feed\nseed 45```\n*PS: un ver de terre augmente de 10XP, tandis qu'une graine augmente de 1XP.*",
            "🐦",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        const resp = choice.split(/ +/);
        // eslint-disable-next-line prefer-const
        let [type, quantity] = resp;
        quantity = Math.sqrt(Math.pow(Number(quantity), 2));

        const str = "La syntaxe saisie est erronée. Veuillez réessayer sous ce modèle:\n```[vous]: !crow-feed\n[Obanai]: <embed>\n"
                    +
                    "[vous]: <item> <quantity>\n\nExemple:\n[vous]: !crow-feed\n[Obanai]: <embed>\n[vous]: seed 50```";


        if (
            type?.length === undefined ? true : !["seed", "worm"].includes(type)
            ||
            isNaN(quantity)
        ) return await this.ctx.reply("Oups...", str, null, null, "warning");

        if (quantity > (type === "seed" ? seeds : worms)) {
            return await this.ctx.reply("Oups...", "Vous n'avez pas autant d'éléments dans votre inventaire !", null, null, "warning");
        }

        const actualExp = iDatas.kasugai_crow_exp;
        const limit = [Math.floor((33250 - actualExp)), Math.floor((33250 - actualExp) / 10)];

        if (quantity > limit[type === "seed" ? 0 : 1]) {
            const str2 = "La quantité d'XP générée est supérieure à la quantité maximale autorisé. "
                         +
                         `Plus d'informations:\nMax: \`[seed]\` x**${limit[0]}** | \`[worm]\` x**${limit[1]}**`;
            return await this.ctx.reply("Oups...", str2, null, null, "warning");
        }

        const expQuantity = quantity * (type === "seed" ? 1 : 10);

        await this.client.inventoryDb.feedCrow(this.message.author.id, type, quantity);
        await this.client.inventoryDb.db.set(this.message.author.id, (type === "seed" ? seeds : worms) - quantity, `materials.${type}`);
        const crowLevel = calcCrowLevel(actualExp + expQuantity);
        return await this.ctx.reply(
            "Nourrir votre oiseau.",
            `Vous nourrisez votre oiseau, et il gagne **${expQuantity}** XP.\n\n> Niveau de corbeau: **${crowLevel.level}**`,
            "🐦",
            null,
            "outline",
        );
    }
}

module.exports = CrowFeed;