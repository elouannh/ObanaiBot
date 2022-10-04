const SQLiteTable = require("../../SQLiteTable");
const AdditionalData = require("../dataclasses/AdditionalData");

function schema(id) {
    return {
        id: id,
        rpg: {
            commandsAmount: {},
            tutorialProgress: {},
        },
    };
}

class AdditionalDb extends SQLiteTable {
    constructor(client) {
        super(client, "additional", schema);
    }

    async load(id) {
        return new AdditionalData(this.client, this.get(id));
    }
}

module.exports = AdditionalDb;