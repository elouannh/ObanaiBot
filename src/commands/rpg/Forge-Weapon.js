const Command = require("../../base/Command");

class ForgeWeapon extends Command {
    constructor() {
        super({
            name: "forge-weapon",
            description: "Permet de forger une arme.",
            descriptionLocalizations: {
                "en-US": "Allows you to forge a weapon.",
            },
            trad: "forgeWeapon",
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 0,
            completedRequests: ["forge-weapon"],
            authorizationBitField: 0b000,
            permissions: 0n,
        });
    }

    async run() {
        const user = this.interaction.user;
        if (!(await this.client.playerDb.exists(user.id))) {
            if (this.client.playerDb.get(user.id).alreadyPlayed) {
                await this.interaction.reply({
                    content: this.lang.systems.playerNotFoundAlreadyPlayed,
                    ephemeral: true,
                }).catch(this.client.catchError);
                return this.end();
            }
            await this.interaction.reply({ content: this.lang.systems.playerNotFound, ephemeral: true })
                .catch(this.client.catchError);
            return this.end();
        }

        const langId = this.client.playerDb.getLang(user.id);
        const activity = await this.client.activityDb.load(user.id);
        const inventory = await this.client.inventoryDb.load(user.id);

        if (activity.forge.forgingSlots.freeSlots.length === 0) {
            await this.interaction.reply({
                content: this.mention + "Vous n'avez aucun emplacement de forge libre.",
            }).catch(this.client.catchError);
            return this.end();
        }

        const requiredResources = {};
        for (const key in activity.forge.blacksmith.resources) {
            requiredResources[key] = [activity.forge.blacksmith.resources[key], inventory.items.materials?.[key]?.amount || 0];
        }

        let missing = false;
        let missingString = "";
        for (const key in requiredResources) {
            const [resource, amount] = requiredResources[key];
            if (amount < resource.amount) {
                missing = true;
                missingString += `**${resource.instance.name} x${resource.amount - amount}** `
                    + `(${this.trad.currently
                        .replace("%AMOUNT", amount)
                        .replace("%MAX", String(resource.amount))})\n`;
            }
        }

        if (missing) {
            await this.interaction.reply({
                content: this.mention + "Il vous manque des ressources.\n\n__Ressources manquantes:__\n"
                    + missingString,
            }).catch(this.client.catchError);
            return this.end();
        }

        const weaponChoice = await this.menu(
            {
                content: this.mention + "Choisissez le type de l'arme que vous voulez forger.",
            },
            Object.keys(this.client.RPGAssetsManager.weapons.types)
                .map(key => this.client.RPGAssetsManager.getWeapon(langId, key, "0"))
                .map(weapon => ({ label: weapon.name, value: weapon.id })),
        );
        if (!weaponChoice) return this.end();

        const weapon = this.client.RPGAssetsManager.getWeapon(langId, weaponChoice, "0");

        const confirmChoice = await this.choice(
            {
                content: this.mention + `Vous êtes sur le point de forger une arme de type **${weapon.name}**. `
                    + "La rareté de l'arme sera donc déterminée de façon __aléatoire__.\n"
                    + "Êtes-vous sûr de vouloir continuer ? Les ressources suivantes seront utilisées:\n\n>>> "
                    + Object.values(requiredResources)
                        .map(([resource]) => `**${resource.instance.name} x${resource.amount}**`)
                        .join("\n"),
            },
            "Forger",
            "Annuler",
        );
        if (!confirmChoice) return this.end();

        if (confirmChoice === "secondary") {
            await this.interaction.editReply({
                content: this.mention + "Vous avez annulé le forgeage.",
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
        else {
            const rarity = this.client.RPGAssetsManager.getProbability("weapons", activity.forge.blacksmith.id)
                .singlePull();
            const weaponWithRarity = this.client.RPGAssetsManager.getWeapon(langId, weaponChoice, String(rarity[0]));

            this.client.activityDb.forgeWeapon(
                user.id, weaponChoice, rarity, Object.values(requiredResources).map(r => r[0]),
            );
            await this.interaction.editReply({
                content: this.mention + "Le forgeron commence désormais à travailler sur une arme de rareté "
                    + `**${weaponWithRarity.rarity}**. L'arme forgée sera donc `
                    + `**${weaponWithRarity.name} ${weaponWithRarity.rarityName}**.\nLa forge durera \n`
                    + `\`${activity.forge.blacksmith.timePerRarity * (rarity[0] + 1)}h\`.`,
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
    }
}

module.exports = ForgeWeapon;