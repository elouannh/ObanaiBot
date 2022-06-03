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
        if (iDatas.kasugai_crow === null) return await this.ctx.reply("Nourrir votre corbeau", "Vous n'avez pas de corbeau à nourrir !", null, null, "error");
        if (calcCrowLevel(iDatas.kasugai_crow_exp).level === 15) return await this.ctx.reply("Nourrir votre corbeau", "Votre corbeau a atteint le niveau max possible ! (15)", null, null, "error");

        const seeds = "materials" in iDatas ? ("seed" in iDatas.materials ? iDatas.materials.seed : 0) : 0;
        const worms = "materials" in iDatas ? ("worm" in iDatas.materials ? iDatas.materials.worm : 0) : 0;

        const scales = {};

        function maxScale(i, elt, scale = 0) {
            if (i >= Math.pow(10, scale) && scale < 5) {
                elt in scales ? scales[elt].push(`${Math.pow(10, scale)}`) : scales[elt] = [`${Math.pow(10, scale)}`];
                return maxScale(i, elt, scale + 1);
            }
            return Math.pow(10, scale);
        }
        maxScale(seeds, "seed");
        maxScale(worms, "worm");

        const datas = {
            "worm": {
                "quantity": worms,
                "scale": scales["worm"],
                "dat": require("../../elements/materials/worm.json"),
            },
            "seed": {
                "quantity": seeds,
                "scale": scales["seed"],
                "dat": require("../../elements/materials/seed.json"),
            },
        };

        datas.worm["str"] = `${datas.worm.dat.emoji} **${datas.worm.dat.name}**`;
        datas.seed["str"] = `${datas.seed.dat.emoji} **${datas.seed.dat.name}**`;

        function foodDisplay(type) {
            return `${datas[type].quantity > 0 ? `${datas[type].str} (**${datas[type].quantity}**)` : `~~${datas[type].str} (**${datas[type].quantity}**)~~`}`;
        }

        const emojis = Object.keys(datas).filter(d => datas[d].quantity > 0).map(d => datas[d].dat.emoji);
        emojis.push("❌");

        const msg = await this.ctx.reply("choix", `${["seed", "worm"].map(e => foodDisplay(e)).join("\n")}`, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, emojis);

        if (choice === "❌") {
            return await this.ctx.reply("choix bouffe", "Vous avez décidé de ne pas donner à manger à votre corbeau.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("choix bouffe", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }
        const choiceDatas = datas[Object.keys(datas).filter(d => datas[d].dat.emoji === choice)];
        const emojis2 = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        const finalEmojis = choiceDatas.scale.map((e, i) => emojis2[i]);
        finalEmojis.push("❌");

        const msg2 = await this.ctx.reply("choix quantité", `${choiceDatas.scale.map((e, i) => `${emojis2[i]} - x**${e}**`).join("\n")}`, null, null, "info");
        const choice2 = await this.ctx.reactionCollection(msg2, finalEmojis);

        if (choice === "❌") {
            return await this.ctx.reply("choix bouffe", "Vous avez décidé de ne pas donner à manger à votre corbeau.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("choix bouffe", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }
        const quantity = choiceDatas.scale?.at(finalEmojis.indexOf(choice2));
        await this.client.inventoryDb.feedCrow(this.message.author.id, choiceDatas.dat.label, quantity);
        return await this.ctx.reply("nourrir corbeau", `vous avez bien nourri votre corbeau et vous avez dépensé ${choiceDatas.dat.name} x**${quantity}**`, null, null, "info");
    }
}

module.exports = new CrowFeed();