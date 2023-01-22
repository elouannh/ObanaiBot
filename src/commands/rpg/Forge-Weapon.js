const Command = require("../../base/Command");

class ForgeWeapon extends Command {
    constructor() {
        super(
            {
                name: "forge-weapon",
                description: "Permet de forger une arme.",
                descriptionLocalizations: {
                    "en-US": "Allows you to forge a weapon.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Forge-Weapon",
                dmPermission: true,
            },
            {
                trad: "forgeWeapon",
                type: [1],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["adventureLocal"],
                authorizationBitField: 0b000,
                permissions: 0n,
                targets: ["read", "write"],
            },
        );
    }

    async run() {
        const user = this.interaction.user;
        if (!(await this.client.playerDb.exists(user.id))) {
            return await this.return(
                this.client.playerDb.get(user.id).alreadyPlayed ?
                    this.lang.systems.playerNotFoundAlreadyPlayed
                    : this.lang.systems.playerNotFound,
                true,
            );
        }
        await this.interaction.deferReply().catch(this.client.catchError);

        const langId = this.client.playerDb.getLang(user.id);
        const activity = await this.client.activityDb.load(user.id);
        const inventory = await this.client.inventoryDb.load(user.id);

        if (activity.forge.forgingSlots.freeSlots.length === 0) {
            return await this.return(this.mention + this.trad.noAvailableSlot);
        }

        const requiredResources = {};
        for (const key in activity.forge.blacksmith.resources) {
            requiredResources[key] = [
                activity.forge.blacksmith.resources[key], inventory.items.materials?.[key]?.amount || 0,
            ];
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
            return await this.return(
                this.mention
                + this.trad.missingResources
                + missingString,
            );
        }

        const weaponChoice = await this.menu(
            {
                content: this.mention + this.trad.weaponTypeChoice,
            },
            Object.keys(this.client.RPGAssetsManager.weapons.types)
                .map(key => this.client.RPGAssetsManager.getWeapon(langId, key, "0"))
                .map(weapon => ({ label: weapon.name, value: weapon.id })),
        );
        if (!weaponChoice) return this.end();

        const weapon = this.client.RPGAssetsManager.getWeapon(langId, weaponChoice, "0");

        const confirmChoice = await this.choice(
            {
                content: this.mention
                    + this.trad.wantsToForge.replace("%WEAPON", weapon.name)
                    + "\n\n>>> "
                    + Object.values(requiredResources)
                        .map(([resource]) => `**${resource.instance.name} x${resource.amount}**`)
                        .join("\n"),
            },
            "Forger",
            "Annuler",
        );
        if (!confirmChoice) return this.end();

        if (confirmChoice === "secondary") {
            return await this.return(this.mention + this.trad.forgeCanceled);
        }
        else {
            const rarity = this.client.RPGAssetsManager.getProbability("weapons", activity.forge.blacksmith.id)
                .singlePull();
            const weaponWithRarity = this.client.RPGAssetsManager.getWeapon(langId, weaponChoice, String(rarity[0]));

            this.client.activityDb.forgeWeapon(
                user.id, weaponChoice, String(rarity[0]), Object.values(requiredResources).map(r => r[0]),
            );
            return await this.return(
                this.mention
                + this.trad.forgedSuccessInfos
                    .replace("%WEAPON_RARITY", weaponWithRarity.rarity)
                    .replace("%WEAPON_NAME", weaponWithRarity.name)
                    .replace("%WEAPON_RARITY_NAME", weaponWithRarity.rarityName)
                + this.trad.forgedSuccessTime
                + activity.forge.blacksmith.timePerRarity * (rarity[0] + 1)
                + this.lang.systems.timeUnits.m[3]
                + "`.",
            );
        }
    }
}

module.exports = ForgeWeapon;