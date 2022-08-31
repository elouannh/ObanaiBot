class SQLiteTableMerger {
    constructor(client, ...ignoreTables) {
        this.client = client;
        this.ignoreTables = [...ignoreTables];

        if (this.client.mergeSQLiteTables === "true") {
            this.merge();
        }
    }

    merge() {
        if (!this.ignoreTables.includes("playerDb")) {
            const playdb = this.client.playerDb.db.array();

            for (const player of playdb) {
                const id = player.id;
                this.client.playerDb.db.set(id, player.breath || "water", "breathingStyle");
                this.client.playerDb.db.delete(id, "breath");
                this.client.playerDb.db.delete(id, "category");
                this.client.playerDb.db.delete(id, "categoryLevel");
            }
        }
        if (!this.ignoreTables.includes("inventoryDb")) {
            const invdb = this.client.inventoryDb.db.array();

            for (const player of invdb) {
                const id = player.id;
                this.client.inventoryDb.db.set(id, player.yens, "wallet");
                this.client.inventoryDb.db.delete(id, "wallet");
                const newCrow = {
                    id: player.kasugai_crow || player.kasugaiCrow.id || "basicCrow",
                    exp: player.kasugai_crow_exp || player.kasugaiCrow.exp || 0,
                    hunger: player.kasugaiCrow.hunger || 100,
                };
                this.client.inventoryDb.db.set(id, newCrow, "kasugaiCrow");
                this.client.inventoryDb.db.delete(id, "kasugai_crow");
                this.client.inventoryDb.db.delete(id, "kasugai_crow_exp");
                const newGrimoire = {
                    id: player.active_grimoire || "",
                    activeSince: player.active_grimoire_since || 0,
                };
                this.client.inventoryDb.db.set(id, newGrimoire, "enchantedGrimoire");
                this.client.inventoryDb.db.delete(id, "active_grimoire");
                this.client.inventoryDb.db.delete(id, "active_grimoire_since");
                const newWeapon = {
                    id: "katana",
                    rarity: player.weapon.rarity || 3,
                };
                this.client.inventoryDb.db.set(id, newWeapon, "weapon");
            }
        }
    }
}

module.exports = SQLiteTableMerger;