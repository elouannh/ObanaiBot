const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class ActivityListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async overListener(key, before, after) {
        if (before !== after) {
            await this.client.questDb.verifyAllQuests(key, "activityDb");
        }
    }
}

module.exports = ActivityListener;