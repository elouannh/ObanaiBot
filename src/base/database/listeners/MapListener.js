const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class MapListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async listener(key, before, after) {
        if (before !== after) {
            // await this.client.questDb.updateSlayerQuest(key, "mapDb");
        }
    }
}

module.exports = MapListener;