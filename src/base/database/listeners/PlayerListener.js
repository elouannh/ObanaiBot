const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class PlayerListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async listener(key, before, after) {
        if (before !== after) {
            // await this.client.questDb.updateSlayerQuest(key, "playerDb");
        }
    }
}

module.exports = PlayerListener;