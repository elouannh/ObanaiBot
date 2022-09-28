const SQLiteTable = require("../../SQLiteTable");
const PlayerData = require("../dataclasses/PlayerData");

function schema(id) {
    return {
        started: false,
        id: id,
        lang: "fr",
        characterId: "0",
        statistics: {
            defense: 1,
            strength: 1,
        },
        breathingStyle: null,
        exp: 0,
        creationDate: Date.now(),
    };
}

class PlayerDb extends SQLiteTable {
    constructor(client) {
        super(client, "player", schema);
    }

    async load(id) {
        return new PlayerData(this.client, this.get(id), this.client.inventoryDb.get(id));
    }

    getLang(id) {
        return this.get(id).lang;
    }
}

module.exports = PlayerDb;