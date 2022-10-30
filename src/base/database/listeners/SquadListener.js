const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class SquadListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async listener(key, before, after, changes) {
        if (before !== after) {
            await this.client.questDb.updateSlayerQuest(key, "squadDb");
        }
    }
}

module.exports = SquadListener;