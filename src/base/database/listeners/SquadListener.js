const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class SquadListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async overListener(key, before, after) {
        if (before !== after) {
            await this.client.questDb.questsCleanup(key, "squadDb");
        }
    }
}

module.exports = SquadListener;