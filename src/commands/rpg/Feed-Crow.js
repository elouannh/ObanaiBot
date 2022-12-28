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
                    .setTitle("Nourrir votre corbeau")
                    .setDescription("Nourrir votre corbeau de liaison coûte **5 vers** et **50 graines**. Il regagnera 15% de son énergie."),
            ],
            components: [
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder()
                            .setLabel("Nourrir")
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId("feed"),
                        new ButtonBuilder()
                            .setLabel("Annuler")
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
                content: this.mention + "Vous avez annulé le nourrissage de votre corbeau.",
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

            const seedAmount = inventory.items.materials.seed.amount;
            const wormAmount = inventory.items.materials.worm.amount;

            if (seedAmount < 50 || wormAmount < 5) {
                await this.interaction.editReply({
                    content: this.mention,
                    embeds: [
                        new EmbedBuilder()
                            .setColor(this.client.enums.Colors.Red)
                            .setTitle("Il vous manque quelques ressources...")
                            .setDescription(
                                "Ressources manquantes:\n"
                                + (seedAmount < 50 ? `**${50 - seedAmount} graines** (actuellement: **${seedAmount}**/50)\n` : "")
                                + (wormAmount < 5 ? `**${5 - wormAmount} vers** (actuellement: **${wormAmount}**/5)` : ""),
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
                        .setTitle("Votre corbeau a été nourri.")
                        .setDescription(`Son énergie est désormais de **${newAmount}%**.`),
                ],
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
    }
}

module.exports = FeedCrow;