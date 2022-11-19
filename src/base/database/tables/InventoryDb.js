const SQLiteTable = require("../../SQLiteTable");
const InventoryData = require("../dataclasses/InventoryData");
const { EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        wallet: 0,
        kasugaiCrow: {
            id: null,
            hunger: 100,
            lastFeeding: Date.now(),
            lastHungerGenerated: Date.now(),
        },
        enchantedGrimoire: {
            id: null,
            activeSince: 0,
        },
        weapon: {
            id: "katana",
            rarity: 3,
        },
        items: {
            enchantedGrimoires: {},
            materials: {},
            questItems: {},
            weapons: {},
        },
    };
}

class InventoryDb extends SQLiteTable {
    constructor(client) {
        super(client, "inventory", schema);
    }

    async load(id) {
        return new InventoryData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }

    get(id) {
        const data = super.get(id, schema);

        if (data.kasugaiCrow.id !== null) {
            const lastHungerGenerated = data.kasugaiCrow.lastHungerGenerated;
            const elapsedTime = Math.floor((Date.now() - lastHungerGenerated) / 1000 / 900);

            if (elapsedTime > 0) {
                let hungerGenerated = data.kasugaiCrow.hunger - elapsedTime;
                if (hungerGenerated < 0) hungerGenerated = 0;
                else if (hungerGenerated > 100) hungerGenerated = 100;

                if (hungerGenerated > 0 && data.kasugaiCrow.hunger !== hungerGenerated) {
                    this.generateKasugaiCrowHunger(id, hungerGenerated);
                }
                data.kasugaiCrow.hunger = hungerGenerated;
            }
        }

        return data;
    }

    /**
     * Generate hunger for the Kasugai Crow.
     * @param {String} id The player ID
     * @param {Number} amount The amount of hunger to generate
     * @returns {void}
     */
    generateKasugaiCrowHunger(id, amount) {
        if (amount < 0) amount = 0;
        else if (amount > 100) amount = 100;
        this.set(id, Math.floor(amount), "kasugaiCrow.hunger");
        this.set(id, Date.now(), "kasugaiCrow.lastHungerGenerated");
    }

    /**
     * Feed the crow to increase its effects bonuses.
     * @param {String} id The player ID
     * @param {Number} amount The amount of hunger to decrease
     * @returns {void}
     */
    feedKasugaiCrow(id, amount) {
        if (amount < 0) amount = 0;
        else if (amount > 100) amount = 100;
        this.set(id, Math.floor(amount), "kasugaiCrow.hunger");
        this.set(id, Date.now(), "kasugaiCrow.lastFeeding");
    }

    /**
     * Add money to the wallet of the player
     * @param {String} id The user ID
     * @param {Number} amount The amount to add
     * @returns {Number} The new wallet amount
     */
    addMoney(id, amount) {
        const previousAmount = this.get(id).wallet;
        const newAmount = previousAmount + amount;
        this.set(id, newAmount, "wallet");
        return newAmount;
    }

    /**
     * Get the embed of the player profile.
     * @param {Object} lang The language object
     * @param {InventoryData} data The inventory data
     * @param {User} user The user
     * @returns {Promise<EmbedBuilder>}
     */
    async getEmbed(lang, data, user) {
        const embed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Player} ⟫ `
                + lang.rpgAssets.embeds.inventoryTitle.replace("%PLAYER", `\`${user.tag}\``),
            )
            .addFields(
                {
                    name: lang.rpgAssets.embeds.wallet,
                    value: ` ¥ ${this.client.util.intRender(data.wallet, ".")}`,
                },
            )
            .setColor(this.client.enums.Colors.Blurple);

        if (data.kasugaiCrow.id !== null) {
            embed.addFields(
                {
                    name: lang.rpgAssets.concepts.kasugaiCrow,
                    value: data.kasugaiCrow.name,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.kasugaiCrowHunger,
                    value: `\`${data.kasugaiCrow.hunger}\`% - `
                        + `${lang.rpgAssets.concepts.kasugaiCrowLastFeeding}: <t:${data.kasugaiCrow.lastFeeding}:R>`,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.kasugaiCrowEffects,
                    value: data.kasugaiCrow.effects
                        .map(e => `${e.name} - \`${e.maxStrength * data.kasugaiCrow.hunger / 100}\`% `
                            + `(${lang.rpgAssets.embeds.maxPercent}: \`${e.maxStrength}\`%)`)
                        .join("\n"),
                    inline: true,
                },
            );
        }
        else {
            embed.addFields(
                {
                    name: lang.rpgAssets.concepts.kasugaiCrow,
                    value: lang.rpgAssets.embeds.noCrow,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: "\u200b", value: "\u200b", inline: true },
            );
        }

        return embed;
    }
}

module.exports = InventoryDb;