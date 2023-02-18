const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class AdditionalListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async overListener(key, before, after) {
        await this.client.questDb.questsCleanup(key, "additionalDb");
    }
}

module.exports = AdditionalListener;