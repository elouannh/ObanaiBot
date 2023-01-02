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

        const firstRequest = await this.interaction.reply({
            content: "Vous voulez forger une arme. Quel type d'arme voulez-vous ?",
            components: [
                new ActionRowBuilder()
                    .setComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("weapon")
                            .setMaxValues(1)
                            .setOptions(
                                Object.keys(this.client.RPGAssetsManager.weapons.types)
                                    .map(key => this.client.RPGAssetsManager.getWeapon(langId, key, "0"))
                                    .map(weapon => ({ label: weapon.name, value: weapon.id })),
                            ),
                    ),
            ],
        }).catch(this.client.catchError);

        const firstResponse = await firstRequest.awaitMessageComponent({
            filter: interaction => interaction.user.id === user.id,
            time: 60000,
        }).catch(this.client.catchError);

        if (!firstResponse) {
            await this.interaction.editReply({
                content: this.lang.systems.choiceIgnored,
            }).catch(this.client.catchError);
            return this.end();
        }
        await firstResponse.deferUpdate().catch(this.client.catchError);

        const weaponType = firstResponse.values[0];

        let activity = await this.client.activityDb.load(user.id);
        let inventory = await this.client.inventoryDb.load(user.id);

        const requiredResources = {};
        for (const key in activity.forge.blacksmith.resources) {
            requiredResources[key] = [activity.forge.blacksmith.resources[key], inventory.items.materials?.[key] || 0];
        }

        const secondRequest = await this.choice(
            {
                content: "Forger une arme coûte des ressources. Ressources demandées pour votre arme:\n"
                    + Object.entries(requiredResources)
                        .map(e => `**${e[1][0].instance.name} x${e[1][0].amount}**`)
                        .join("\n")
                    + "\n\nÊtes vous sûr de vouloir forger votre arme ?",
            },
            "Forger",
            "Annuler",
        );

        return this.end();
    }
}

module.exports = ForgeWeapon;