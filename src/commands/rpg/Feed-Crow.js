const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class FeedCrow extends Command {
    constructor() {
        super({
            name: "feed-crow",
            description: "Permet de nourrir son corbeau kasugai.",
            descriptionLocalizations: {
                "en-US": "Allows you to feed your kasugai crow.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
            completedRequests: ["feed-crow"],
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

        let inventory = await this.client.inventoryDb.load(user.id);

        if (inventory.kasugaiCrow.id === null) {
            await this.interaction.reply({ content: this.lang.rpgAssets.embeds.noCrow, ephemeral: true })
                .catch(this.client.catchError);
            return this.end();
        }

        const wantsToFeed = await this.interaction.reply({
            content: this.mention,
            embeds: [
                new EmbedBuilder()
                    .setColor(this.client.enums.Colors.Blurple)
                    .setTitle(this.lang.commands.feedCrow.feedCrow)
                    .setDescription(this.lang.commands.feedCrow.resourcesNeeded),
            ],
            components: [
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder()
                            .setLabel(this.lang.commands.feedCrow.feedButton)
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId("feed"),
                        new ButtonBuilder()
                            .setLabel(this.lang.commands.feedCrow.cancelButton)
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId("cancel"),
                    ),
            ],
        }).catch(this.client.catchError);

        const feedResponse = await wantsToFeed.awaitMessageComponent({
            filter: inter => inter.user.id === user.id,
            time: 60_000,
        }).catch(this.client.catchError);

        if (!feedResponse) {
            await this.interaction.editReply({
                content: this.mention + this.lang.systems.choiceIgnored,
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
        await feedResponse.deferUpdate().catch(this.client.catchError);

        if (feedResponse.customId === "cancel") {
            await this.interaction.editReply({
                content: this.mention + this.lang.commands.feedCrow.feedingCanceled,
                embeds: [],
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
        else {
            inventory = await this.client.inventoryDb.load(user.id);

            if (inventory.kasugaiCrow.id === null) {
                await this.interaction.reply({ content: this.lang.rpgAssets.embeds.noCrow, ephemeral: true })
                    .catch(this.client.catchError);
                return this.end();
            }

            const seedAmount = inventory.items.materials?.seed?.amount || 0;
            const wormAmount = inventory.items.materials?.worm?.amount || 0;
            const seedInstance = this.client.RPGAssetsManager.getMaterial(
                this.client.playerDb.getLang(user.id), "seed",
            );
            const wormInstance = this.client.RPGAssetsManager.getMaterial(
                this.client.playerDb.getLang(user.id), "worm",
            );

            if (seedAmount < 50 || wormAmount < 5) {
                await this.interaction.editReply({
                    content: this.mention,
                    embeds: [
                        new EmbedBuilder()
                            .setColor(this.client.enums.Colors.Red)
                            .setTitle(this.lang.commands.feedCrow.resourcesMissing)
                            .setDescription(
                                `${this.lang.commands.feedCrow.missing}\n`
                                + (seedAmount < 50 ?
                                    `**${seedInstance.name} x${50 - seedAmount}** `
                                    + `(${this.lang.commands.feedCrow.currently
                                            .replace("%AMOUNT", seedAmount)
                                            .replace("%MAX", "50")})\n`
                                    : ""
                                )
                                + (wormAmount < 5 ?
                                    `**${wormInstance.name} x${5 - wormAmount}** `
                                    + `(${this.lang.commands.feedCrow.currently
                                            .replace("%AMOUNT", wormAmount)
                                            .replace("%MAX", "5")})`
                                    : ""
                                ),
                            ),
                    ],
                    components: [],
                }).catch(this.client.catchError);
                return this.end();
            }

            const newAmount = Math.min(inventory.kasugaiCrow.hunger + 15, 100);
            await this.client.inventoryDb.feedKasugaiCrow(this.interaction.user.id, newAmount);
            await this.interaction.editReply({
                content: this.mention,
                embeds: [
                    new EmbedBuilder()
                        .setColor(this.client.enums.Colors.Green)
                        .setTitle(this.lang.commands.feedCrow.feedCrowSuccess)
                        .setDescription(this.lang.commands.feedCrow.currentEnergy.replace("%ENERGY", newAmount)),
                ],
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
    }
}

module.exports = FeedCrow;