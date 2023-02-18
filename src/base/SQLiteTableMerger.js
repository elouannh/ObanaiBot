const Enmap = require("enmap");

class SQLiteTableMerger {
    constructor(client, ...tables) {
        this.client = client;
        this.tables = [...tables];

        if (this.client.env.MERGE_SQLITE_TABLES === "1") {
            this.client.util.timelog("Merging SQLite tables...", "yellow");
            this.merge();
            this.client.util.timelog("SQLite Tables merged, processing is turning off.", "yellow");
            this.client.envUpdate("MERGE_SQLITE_TABLES", "0");
            setTimeout(() => {
                throw new Error("SQLite Tables merged, processing is turning off.");
            }, 5000);
        }
    }

    merge() {
        if (this.tables.includes("activityDb")) {
            const dbs = { a: new Enmap({ name: "activity" }), b: new Enmap({ name: "activityDb" }) };
            dbs.b.destroy();
        }
        if (this.tables.includes("externalServerDb")) {
            const dbs = { a: new Enmap({ name: "externalServer" }), b: new Enmap({ name: "externalServerDb" }) };
            dbs.b.destroy();
        }
        if (this.tables.includes("guildDb")) {
            const dbs = { a: new Enmap({ name: "guild" }), b: new Enmap({ name: "guildDb" }) };
            dbs.b.destroy();
        }
        if (this.tables.includes("inventoryDb")) {
            const dbs = { a: new Enmap({ name: "inventory" }), b: new Enmap({ name: "inventoryDb" }) };

            for (const player of dbs.b.array()) {
                const id = player.id;
                this.client.inventoryDb.ensureInDeep(id);
                dbs.a.set(id, player.yens, "wallet");
                const newGrimoire = {
                    id: player.active_grimoire || player.enchantedGrimoire?.id || null,
                    activeSince: player.active_grimoire_since || player.enchantedGrimoire?.activeSince || 0,
                };
                dbs.a.set(id, newGrimoire, "enchantedGrimoire");
                const newWeapon = {
                    id: "katana",
                    rarity: String(player.weapon.rarity) || "3",
                };
                dbs.a.set(id, newWeapon, "weapon");
                const items = {
                    enchantedGrimoires: player.grimoires,
                    materials: {},
                    questItems: {},
                    weapons: {},
                };
                for (const wp of player.weapons) {
                    if ("rarity" in (wp ?? {})) {
                        if ((items.weapons["katana"] ?? "null") instanceof Object) {
                            if (items.weapons["katana"][wp.rarity] instanceof Number) {
                                items.weapons["katana"][wp.rarity] += 1;
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
                dbs.a.set(id, items, "items");
            }

            dbs.b.destroy();
        }
        if (this.tables.includes("mapDb")) {
            const dbs = { a: new Enmap({ name: "map" }), b: new Enmap({ name: "mapDb" }) };
            dbs.b.destroy();
        }
        if (this.tables.includes("playerDb")) {
            new Enmap({ name: "playerDb" }).destroy();
        }
        if (this.tables.includes("questDb")) {
            new Enmap({ name: "questDb" }).destroy();
        }
        if (this.tables.includes("squadDb")) {
            new Enmap({ name: "squadDb" }).destroy();
        }
        if (this.tables.includes("internalServerManager")) {
            new Enmap({ name: "internalServerManager" }).destroy();
        }
    }
}

module.exports = SQLiteTableMerger;