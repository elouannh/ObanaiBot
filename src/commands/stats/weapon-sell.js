const Command = require("../../base/Command");

class WeaponSell extends Command {
    constructor() {
        super({
            category: "Stats",
            cooldown: 15,
            description: "Commande permettant de vendre une arme.",
            finishRequest: "ADVENTURE",
            name: "weapon-sell",
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) {
            return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");
        }

        const iDatas = await this.client.inventoryDb.get(this.message.author.id);
        let weapons = "weapons" in iDatas ? iDatas.weapons : [];

        if (weapons.length === 0) {
            return await this.ctx.reply(
                "Oups...",
                "Il semblerait que vous n'ayez aucune arme en stock.",
                null,
                null,
                "warning",
            );
        }

        weapons = weapons.sort((a, b) => b.rarity - a.rarity);

        let weaponToSell = weapons?.at(0);
        let isGood = true;

        const msg = await this.ctx.reply(
            "Vente d'arme.",
            `Vous possédez plusieurs armes.\n\n${
                weapons.map((e, i) => `**${i + 1}** | \`rareté: ${e.rarity}\` | ${e.name}`).join("\n")
            }`
            +
            "\n\nRépondez avec le numéro correspondant à l'arme que vous souhaitez vendre."
            +
            " Répondre avec `n` (non) pour annuler.",
            "🗡️",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        if (weapons.map((e, i) => String(i + 1)).includes(choice)) {
            weaponToSell = weapons?.at(Number(choice - 1)) ?? weapons?.at(0);
        }
        else if (this.ctx.isResp(choice, "n")) {
            isGood = false;
            return await this.ctx.reply(
                "Vente d'arme.",
                "Vous avez décidé de ne pas vendre d'arme.",
                "🗡️",
                null,
                "outline",
            );
        }
        else {
            isGood = false;
            return await this.ctx.reply("Vente d'arme.", "La commande n'a pas aboutie.", null, null, "timeout");
        }

        if (!isGood) return;

        const price = await this.client.inventoryDb.earnYens(
            this.message.author.id,
            Math.pow(10, weaponToSell.rarity) / 2,
        );

        const msg2 = await this.ctx.reply(
            "Vente d'arme.",
            "Êtes-vous sûr de vouloir vendre cette arme ?"
            +
            ` Vous gagnerez **${price} ¥**.`
            +
            "\n\nRépondre avec `y` (oui) ou `n` (non).",
            "🗡️",
            null,
            "outline",
        );

        const choice2 = await this.ctx.messageCollection(msg2);

        if (this.ctx.isResp(choice2, "y")) {
            await this.client.inventoryDb.sellWeapon(this.message.author.id, weaponToSell);
            return await this.ctx.reply(
                "Vente d'arme.",
                "L'arme a bien été vendue.",
                "🗡️",
                null,
                "outline",
            );
        }
        else if (this.ctx.isResp(choice2, "n")) {
            return await this.ctx.reply(
                "Vente d'arme.",
                "Vous avez décidé de ne pas vendre d'arme.",
                "🗡️",
                null,
                "outline",
            );
        }
        else {
            return await this.ctx.reply("Vente d'arme.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = WeaponSell;