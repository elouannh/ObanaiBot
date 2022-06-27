const Command = require("../../base/Command");

class WeaponSell extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["weapon-sell", "wsell"],
            args: [],
            category: "Stats",
            cooldown: 15,
            description: "Commande permettant de vendre une arme.",
            examples: ["weapon-sell"],
            finishRequest: "ADVENTURE",
            name: "weapon-sell",
            ownerOnly: false,
            permissions: 0,
            syntax: "weapon-sell",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const iDatas = await this.client.inventoryDb.get(this.message.author.id);
        const weapons = "weapons" in iDatas ? iDatas.weapons : [];

        if (weapons.length === 0) return await this.ctx.reply("Oups...", "Il semblerait que vous n'ayez aucune arme en stock.", null, null, "warning");

        let weaponToSell = weapons?.at(0);
        let isGood = true;

        const msg = await this.ctx.reply(
            "Changement d'arme.",
            `Vous possédez plusieurs armes.\n\n${weapons.map((e, i) => `**${i + 1}** | \`rareté: ${e.rarity}\` | ${e.name}`).join("\n")}`
            +
            "\n\nRépondez avec le numéro correspondant à l'arme que vous souhaitez vendre. Répondre avec `n` (non) pour annuler.",
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
                "Changement d'arme.",
                "Vous avez décidé de ne pas changer d'arme.",
                "🗡️",
                null,
                "outline",
            );
        }
        else {
            isGood = false;
            return await this.ctx.reply("Changement d'arme.", "La commande n'a pas aboutie.", null, null, "timeout");
        }

        if (!isGood) return;

        const price = Math.pow(10, weaponToSell.rarity) / 2;
    }
}

module.exports = new WeaponSell();