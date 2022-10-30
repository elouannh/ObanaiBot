const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class AdditionalListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    // eslint-disable-next-line no-unused-vars
    async listener(key, before, after, changes) {
        if (before !== after) {
            await this.client.questDb.updateSlayerQuest(key, "additionalDb");
        }
    }
}

module.exports = AdditionalListener;