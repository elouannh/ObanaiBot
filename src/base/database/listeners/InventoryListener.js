const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class InventoryListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async listener(key, before, after, changes) {
        if (before !== after) {
            await this.client.questDb.updateSlayerQuest(key, "inventoryDb");
        }
    }
}

module.exports = InventoryListener;