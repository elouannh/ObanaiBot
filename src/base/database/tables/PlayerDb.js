const SQLiteTable = require("./SQLiteTable");
const PlayerDatas = require("../subclasses/PlayerDatas");

function schema(id) {
    return {
        started: false,
        id: id,
        lang: "fr",
        stats: {
            agility: 1,
            defense: 1,
            strength: 1,
            speed: 1,
        },
        breathingStyle: "water",
        exp: 0,
        created: Date.now(),
    };
}

class PlayerDb extends SQLiteTable {
    constructor(client) {
        super(client, "player", schema);
    }

    async load(id) {
        return new PlayerDatas(this.client, this.get(id), this.client.inventoryDb.db.get(id));
    }

    getLang(id) {
        return this.get(id).lang;
    }
}

module.exports = PlayerDb;