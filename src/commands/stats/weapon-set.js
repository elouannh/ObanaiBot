const Command = require("../../base/Command");

class WeaponSet extends Command {
    constructor() {
        super({
            aliases: ["weapon-set", "wset"],
            args: [],
            category: "Stats",
            cooldown: 15,
            description: "Commande permettant d'équiper une arme.",
            examples: ["[p]weapon-set"],
            finishRequest: "ADVENTURE",
            name: "weapon-set",
            private: "none",
            permissions: 0,
            syntax: "weapon-set",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const iDatas = await this.client.inventoryDb.get(this.message.author.id);
        const pDatas = await this.client.playerDb.get(this.message.author.id);
        const weapons = "weapons" in iDatas ? iDatas.weapons : [];

        if (weapons.length === 0) return await this.ctx.reply("Oups...", "Il semblerait que vous n'ayez aucune arme en stock.", null, null, "warning");

        const goodWeapons = weapons.filter(w => w.label === require(`../../elements/categories/${pDatas.category}.json`).weapon).sort((a, b) => b.rarity - a.rarity);
        if (goodWeapons.length === 0) {
            return await this.ctx.reply(
                "Oups...",
                `Vous ne possédez aucune arme apte pour la catégorie **${require(`../../elements/categories/${pDatas.category}.json`).name}** en stock.`,
                null,
                null,
                "warning",
            );
        }

        const actualWeapon = iDatas.weapon;
        let weaponToSet = goodWeapons?.at(0);
        let isGood = true;

        if (goodWeapons.length > 1) {
            const msg = await this.ctx.reply(
                "Changement d'arme.",
                `Vous possédez plusieurs armes.\n\n${goodWeapons.map((e, i) => `**${i + 1}** | \`rareté: ${e.rarity}\` | ${e.name}`).join("\n")}`
                +
                "\n\nRépondez avec le numéro correspondant à l'arme que vous souhaitez équiper. Répondre avec `n` (non) pour annuler.",
                "🗡️",
                null,
                "outline",
            );
            const choice = await this.ctx.messageCollection(msg);

            if (goodWeapons.map((e, i) => String(i + 1)).includes(choice)) {
                weaponToSet = goodWeapons?.at(Number(choice - 1)) ?? goodWeapons?.at(0);
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
        }

        if (!isGood) return;

        const msg2 = await this.ctx.reply(
            "Changement d'arme.",
            "Êtes-vous sûr de vouloir changer d'arme ? Celle équipée retournera dans votre inventaire."
            +
            `\n**Ancienne arme:** ${actualWeapon.name} (rareté **${actualWeapon.rarity}**)\n**Nouvelle arme:** ${weaponToSet.name} (rareté **${weaponToSet.rarity}**)`
            +
            "\n\nRépondre avec `y` (oui) ou `n` (non).",
            "🗡️",
            null,
            "outline",
        );

        const choice2 = await this.ctx.messageCollection(msg2);

        if (this.ctx.isResp(choice2, "y")) {
            await this.client.inventoryDb.changeWeapon(this.message.author.id, weaponToSet);
            return await this.ctx.reply(
                "Changement d'arme.",
                "Le changement d'arme a bien été effectué.",
                "🗡️",
                null,
                "outline",
            );
        }
        else if (this.ctx.isResp(choice2, "n")) {
            return await this.ctx.reply(
                "Changement d'arme.",
                "Vous avez décidé de ne pas changer d'arme.",
                "🗡️",
                null,
                "outline",
            );
        }
        else {
            return await this.ctx.reply("Changement d'arme.", "La commande n'a pas aboutie.", null, null, "timeout");
        }


    }
}

module.exports = WeaponSet;