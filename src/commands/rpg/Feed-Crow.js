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
            trad: "feedCrow",
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
            completedRequests: ["adventure"],
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

        const inventory = await this.client.inventoryDb.load(user.id);

        if (inventory.kasugaiCrow.id === null) {
            await this.interaction.reply({ content: this.mention + this.trad.noCrow })
                .catch(this.client.catchError);
            return this.end();
        }
        if (inventory.kasugaiCrow.hunger === 100) {
            await this.interaction.reply({ content: this.mention + this.trad.noHunger })
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
                content: this.mention + this.trad.missingResources + "\n"
                    + (seedAmount < 50 ?
                            `**${seedInstance.name} x${50 - seedAmount}** `
                            + `(${this.trad.currently
                                .replace("%AMOUNT", seedAmount)
                                .replace("%MAX", "50")})\n`
                            : ""
                    )
                    + (wormAmount < 5 ?
                            `**${wormInstance.name} x${5 - wormAmount}** `
                            + `(${this.trad.currently
                                .replace("%AMOUNT", wormAmount)
                                .replace("%MAX", "5")})`
                            : ""
                    ),
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }

        const feedResponse = await this.choice(
            {
                content: this.mention + `${this.trad.wantsToFeed}\n\n`
                    + `${this.trad.required}\n`
                    + "**" + seedInstance.name + " x50**\n"
                    + "**" + wormInstance.name + " x5**",
            },
            this.trad.feedButton,
            this.trad.cancelButton,
        );
        if (feedResponse === null) return this.end();

        if (feedResponse === "secondary") {
            await this.interaction.editReply({
                content: this.mention + this.trad.canceled,
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }

        const newAmount = Math.min(inventory.kasugaiCrow.hunger + 15, 100);
        await this.client.inventoryDb.feedKasugaiCrow(this.interaction.user.id, newAmount);
        await this.interaction.editReply({
            content: this.mention + this.trad.fed.replace("%AMOUNT", newAmount),
            components: [],
        }).catch(this.client.catchError);
        return this.end();
    }
}

module.exports = FeedCrow;