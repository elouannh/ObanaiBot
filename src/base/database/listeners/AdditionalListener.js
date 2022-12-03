const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class AdditionalListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async overListener(key, before, after) {
        if (before !== after) {
            await this.client.questDb.verifyAllQuests(key, "additionalDb");
        }
    }
}

module.exports = AdditionalListener;