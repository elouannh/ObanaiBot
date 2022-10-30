const SQLiteTable = require("../../SQLiteTable");
const InventoryData = require("../dataclasses/InventoryData");

function schema(id) {
    return {
        id: id,
        wallet: 0,
        kasugaiCrow: {
            id: null,
            exp: 0,
            hunger: 100,
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

}

module.exports = InventoryDb;