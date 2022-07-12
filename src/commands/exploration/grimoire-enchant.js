const Command = require("../../base/Command");
const fs = require("fs");

class GrimoireEnchant extends Command {
    constructor() {
        super({
            aliases: ["grimoire-enchant", "ge"],
            args: [],
            category: "Exploration",
            cooldown: 10,
            description: "Commande permettant d'enchanter des grimoires.",
            examples: ["[p]grimoire-enchant"],
            finishRequest: "ADVENTURE",
            name: "grimoire-enchant",
            private: "none",
            permissions: 0,
            syntax: "grimoire-enchant",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const grims = fs.readdirSync("./src/elements/grimoires").map(e => require(`../../elements/grimoires/${e}`)).filter(e => !["eternal", "mastery"].includes(e.label));

        const grimoire = grims[Math.floor(Math.random() * grims.length)];
        const msg = await this.ctx.reply(
            "Enchanter un grimoire.",
            "Voulez-vous dépenser un **grimoire vierge** et le donner à Franky pour qu'il l'enchante ?"
            +
            "\n\nRépondre avec `y` (oui) ou `n` (non).",
            "🪄",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        if (this.ctx.isResp(choice, "y")) {
            const iDatas = await this.client.inventoryDb.get(this.message.author.id);
            const mDatas = await this.client.mapDb.get(this.message.author.id);

            const grimoireModels = "materials" in iDatas ? ("grimoire" in iDatas.materials ? iDatas.materials.grimoire : 0) : 0;
            if (grimoireModels === 0) return await this.ctx.reply("Oups...", "Vous ne possédez pas de grimoire vierge.", null, null, "warning");
            if (mDatas.region !== 9) {
                return await this.ctx.reply("Oups...", "Commencez par vous rendre au **quartier Yoshiwara**, et rendez visite à Franky le vioc' !", null, null, "warning");
            }
            if (mDatas.area !== 1) return await this.ctx.reply("Oups...", "Allez rendre visite à Franky le vioc' !", null, null, "warning");

            await this.ctx.reply(
                "Enchanter un grimoire.",
                `Vous avez enchanté le grimoire ! Vous recevez **${grimoire.name}** !`,
                "🪄",
                null,
                "outline",
            );
            await this.client.inventoryDb.addGrimoire(this.message.author.id, grimoire.label);
            await this.client.inventoryDb.db.dec(this.message.author.id, "materials.grimoire");
        }
        else if (this.ctx.isResp(choice, "n")) {
            await this.ctx.reply("Enchanter un grimoire.", "Vous n'avez pas enchanté votre grimoire.", "🪄", null, "outline");
        }
        else {
            await this.ctx.reply("Enchanter un grimoire.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = GrimoireEnchant;