const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class MapListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    // eslint-disable-next-line no-unused-vars
    async listener(key, before, after, changes) {
        if (before !== after) {
            await this.client.questDb.updateSlayerQuest(key, "mapDb");
        }
    }
}

module.exports = MapListener;