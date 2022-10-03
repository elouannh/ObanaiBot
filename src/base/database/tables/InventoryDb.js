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

    addMoney(id, amount) {
        this.set(id, this.get(id).wallet + amount, "wallet");
    }

}

module.exports = InventoryDb;