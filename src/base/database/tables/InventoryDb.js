const SQLiteTable = require("../../SQLiteTable");
const InventoryData = require("../dataclasses/InventoryData");
const { EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        wallet: 0,
        kasugaiCrow: {
            id: null,
            exp: 0,
            hunger: 100,
            lastFeeding: Date.now(),
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
            const lastFeeding = data.kasugaiCrow.lastFeeding;
            const hungerGenerated = Math.floor(data.kasugaiCrow.hunger - (Date.now() - lastFeeding) / 1000 / 60 / 15);
            if (hungerGenerated > 0) this.generateHunger(id, hungerGenerated);
        }
    }

    /**
     * Generate hunger for the Kasugai Crow.
     * @param {String} id The player ID
     * @param {Number} amount The amount of hunger to generate
     * @returns {void}
     */
    generateHunger(id, amount) {
        if (amount < 0) amount = 0;
        else if (amount > 100) amount = 100;
        this.set(id, Math.ceil(amount), "kasugaiCrow.hunger");
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
            .setColor(this.client.enums.Colors.Blurple);

        if (data.kasugaiCrow.id !== null) {
            console.log("foo");
        }

        return embed;
    }
}

module.exports = InventoryDb;