const Enmap = require("enmap");

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
            const playdb = new Enmap({ name: "playerDb" }).array();

            for (const player of playdb) {
                const id = player.id;
                this.client.playerDb.db.set(id, player);
                this.client.playerDb.db.set(id, player.breath || "water", "breathingStyle");
                this.client.playerDb.db.delete(id, "breath");
                this.client.playerDb.db.delete(id, "category");
                this.client.playerDb.db.delete(id, "categoryLevel");
            }
        }
        if (!this.ignoreTables.includes("inventoryDb")) {
            const invdb = new Enmap({ name: "inventoryDb" }).array();

            for (const player of invdb) {
                const id = player.id;
                this.client.inventoryDb.db.set(id, player);
                this.client.inventoryDb.db.set(id, player.yens, "wallet");
                this.client.inventoryDb.db.delete(id, "yens");
                const newCrow = {
                    id: player.kasugai_crow || player.kasugaiCrow?.id || "basicCrow",
                    exp: player.kasugai_crow_exp || player.kasugaiCrow?.exp || 0,
                    hunger: player.kasugaiCrow?.hunger || 100,
                };
                this.client.inventoryDb.db.set(id, newCrow, "kasugaiCrow");
                this.client.inventoryDb.db.delete(id, "kasugai_crow");
                this.client.inventoryDb.db.delete(id, "kasugai_crow_exp");
                const newGrimoire = {
                    id: player.active_grimoire || player.enchantedGrimoire?.id || "",
                    activeSince: player.active_grimoire_since || player.enchantedGrimoire?.activeSince || 0,
                };
                this.client.inventoryDb.db.set(id, newGrimoire, "enchantedGrimoire");
                this.client.inventoryDb.db.delete(id, "active_grimoire");
                this.client.inventoryDb.db.delete(id, "active_grimoire_since");
                const newWeapon = {
                    id: "katana",
                    rarity: player.weapon.rarity || 3,
                };
                this.client.inventoryDb.db.set(id, newWeapon, "weapon");
                const items = {
                    enchantedGrimoires: player.grimoires,
                    materials: {},
                    questItems: {},
                    weapons: {},
                };
                for (const wp of player.weapons) {
                    if ("rarity" in (wp || {})) {
                        if ((items.weapons["katana"] ?? "null") instanceof Object) {
                            if (items.weapons["katana"][String(wp.rarity)] instanceof Number) {
                                items.weapons["katana"][String(wp.rarity)] += 1;
                            }
                        }
                        else {
                            items.weapons["katana"] = {
                                [String(wp.rarity)]: 1,
                            };
                        }
                    }
                }
                for (let mat in player.materials) {
                    const key = mat;
                    if (mat === "weapon_model") mat = "weaponBase";
                    items.materials[mat] = player.materials[key];
                }
                for (const mat in items.questItems) {
                    const key = mat;
                    if (mat === "hime_hair") mat = "himeHairStrand";
                    if (mat === "pierre_body") mat = "remainsOfPierre";
                    items.questItems[mat] = player.questItems[key];
                }
                this.client.inventoryDb.db.set(id, items, "items");
                this.client.inventoryDb.db.delete(id, "grimoires");
                this.client.inventoryDb.db.delete(id, "weapons");
                this.client.inventoryDb.db.delete(id, "materials");
                this.client.inventoryDb.db.delete(id, "questItems");
            }
        }
    }
}

module.exports = SQLiteTableMerger;