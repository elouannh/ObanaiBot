const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class ActivityListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async listener(key, before, after) {
        if (before !== after) {
            await this.client.questDb.updateSlayerQuest(key, "activityDb");
        }
    }
}

module.exports = ActivityListener;