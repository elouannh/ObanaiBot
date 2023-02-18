const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class MapListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async overListener(key, before, after) {
        await this.client.questDb.questsCleanup(key, "mapDb");
    }
}

module.exports = MapListener;