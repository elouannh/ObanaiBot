const Command = require("../../base/Command");
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class ForgeWeapon extends Command {
    constructor() {
        super({
            name: "forge-weapon",
            description: "Permet de forger une arme.",
            descriptionLocalizations: {
                "en-US": "Allows you to forge a weapon.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
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
        const activity = this.client.activityDb.load(user.id);
        const inventory = this.client.inventoryDb.load(user.id);

        if (activity.forge.forgingSlots.freeSlots.length === 0) {
            await this.interaction.reply({
                content: this.mention + "Vous n'avez aucun emplacement de forge libre.",
            }).catch(this.client.catchError);
            return this.end();
        }

        const requiredResources = {};
        for (const key in activity.forge.blacksmith.resources) {
            requiredResources[key] = [activity.forge.blacksmith.resources[key], inventory.items.materials?.[key] || 0];
        }

        console.log(requiredResources);

        Object.keys(this.client.RPGAssetsManager.weapons.types)
            .map(key => this.client.RPGAssetsManager.getWeapon(langId, key, "0"))
            .map(weapon => ({ label: weapon.name, value: weapon.id }));


    }
}

module.exports = ForgeWeapon;