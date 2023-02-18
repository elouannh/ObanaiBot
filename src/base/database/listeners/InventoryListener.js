const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class InventoryListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async overListener(key, before, after) {
        await this.client.questDb.questsCleanup(key, "inventoryDb");
    }
}

module.exports = InventoryListener;