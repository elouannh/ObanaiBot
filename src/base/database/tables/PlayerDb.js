const SQLiteTable = require("../../SQLiteTable");
const PlayerData = require("../dataclasses/PlayerData");

function schema(id) {
    return {
        alreadyPlayed: false,
        id: id,
        lang: "fr",
        characterId: null,
        statistics: {
            defense: 1,
            strength: 1,
        },
        breathingStyle: null,
        exp: 0,
        creationDate: Date.now(),
    };
}

class PlayerDb extends SQLiteTable {
    constructor(client) {
        super(client, "player", schema);
    }

    async load(id) {
        return new PlayerData(this.client, this.get(id), this.client.inventoryDb.get(id));
    }

    /**
     * Create a new player in all the databases.
     * @param {String} id The player ID
     * @param {String} characterId The pnj ID of the user for the RPG game
     * @returns {Promise<void>}
     */
    async create(id, characterId = "0") {
        await this.client.activityDb.ensureInDeep(id);
        await this.client.additionalDb.ensureInDeep(id);
        await this.client.inventoryDb.ensureInDeep(id);
        await this.client.mapDb.ensureInDeep(id);
        await this.client.questDb.ensureInDeep(id);
        await this.client.squadDb.ensureInDeep(id);
        await this.set(id, characterId, "characterId");
    }

    /**
     * Returns if a player exists in the database.
     * @param {String} id The player ID
     * @returns {Promise<boolean>}
     */
    async exists(id) {
        for (const db of [
            this,
            this.client.activityDb,
            this.client.additionalDb,
            this.client.inventoryDb,
            this.client.mapDb,
            this.client.questDb,
            this.client.squadDb,
        ]) {
            if ((await db.get(id))?.schemaInstance) return false;
        }
        return true;
    }

    /**
     * Get the language of the player.
     * @param {String} id The player ID
     * @returns {String}
     */
    getLang(id) {
        return this.get(id).lang;
    }
}

module.exports = PlayerDb;