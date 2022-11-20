const SQLiteTable = require("../../SQLiteTable");
const MapData = require("../dataclasses/MapData");
const { EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        regionId: "0",
        areaId: "0",
        exploration: {},
    };
}

class MapDb extends SQLiteTable {
    constructor(client) {
        super(client, "map", schema);
    }

    async load(id) {
        return new MapData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }

    /**
     * Get the embed of the player profile.
     * @param {Object} lang The language object
     * @param {MapData} data The inventory data
     * @param {User} user The user
     * @returns {Promise<EmbedBuilder>}
     */
    async getEmbed(lang, data, user) {
        return new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Player} ⟫ `
                + lang.rpgAssets.embeds.mapTitle.replace("%PLAYER", `\`${user.tag}\``),
            )
            .setColor(this.client.enums.Colors.Blurple);
    }
}

module.exports = MapDb;