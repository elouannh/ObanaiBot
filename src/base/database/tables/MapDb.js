const SQLiteTable = require("../../SQLiteTable");
const MapData = require("../dataclasses/MapData");
const MapListener = require("../listeners/MapListener");
const { EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        districtId: "5",
        sectorId: "0",
        exploration: {
            excavated: {},
        },
    };
}

class MapDb extends SQLiteTable {
    constructor(client) {
        super(client, "map", schema, MapListener);
    }

    async load(id) {
        return new MapData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }

    get(key) {
        const data = super.get(key);

        for (const rKey in data.exploration.excavated) {
            const districtExcavatedSectors = data.exploration.excavated[rKey];
            if (districtExcavatedSectors.length === 0) {
                delete data.exploration.excavated[rKey];
                this.delete(key, `exploration.excavated.${rKey}`);
                continue;
            }
            for (const [sectorKey, sectorDate] of districtExcavatedSectors) {
                if (this.client.util.dateToString(new Date(sectorDate)) !== this.client.util.dateToString(new Date())) {
                    data.exploration.excavated[rKey].splice(districtExcavatedSectors.indexOf([sectorKey, sectorDate]), 1);
                    this.resetExcavation(key, rKey, sectorKey);
                }
            }
        }

        return data;
    }

    /**
     * Function that moves a player on an sector/district.
     * @param {String} id The user ID
     * @param {String} districtId The district ID
     * @param {String} sectorId The sector ID
     */
    move(id, districtId, sectorId) {
        this.set(id, districtId, "districtId");
        this.set(id, sectorId, "sectorId");
    }

    /**
     * Set an sector as already excavated.
     * @param {String} id The user ID
     * @param {String} districtId The district ID
     * @param {String} sectorId The sector ID
     * @returns {void}
     */
    explore(id, districtId, sectorId) {
        const data = this.get(id);
        const sectors = data.exploration.excavated[districtId] || [];
        if (!sectors.map(e => e[0]).includes(sectorId)) sectors.push([sectorId, Date.now()]);
        this.set(id, sectors, `exploration.excavated.${districtId}`);
    }

    /**
     * Set a district and an sector as none excavated.
     * @param {String} id The user ID
     * @param {String} districtId The district ID
     * @param {String} sectorId The sector ID
     * @returns {void}
     */
    resetExcavation(id, districtId, sectorId) {
        const data = this.get(id);
        const sectors = data.exploration.excavated[districtId] || [];
        if (sectors.includes(sectorId)) sectors.splice(sectors.indexOf(sectorId), 1);
        this.set(id, sectors, `exploration.excavated.${districtId}`);
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
                `⟪ ${this.client.enums.Rpg.Databases.Map} ⟫ `
                + lang.rpgAssets.embeds.mapTitle.replace("%PLAYER", `\`${user.tag}\``),
            )
            .setColor(this.client.enums.Colors.Blurple)
            .addFields(
                {
                    name: lang.rpgAssets.concepts.district,
                    value: `${data.district.name}`,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.sector,
                    value: `${data.sector.name}\n__${lang.rpgAssets.concepts.biome}:__ **${data.sector.biome.name}**`,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: false },
                {
                    name: lang.rpgAssets.concepts.exploration,
                    value: Object.keys(data.exploration).length === 0 ? lang.rpgAssets.embeds.noDataToDisplay : "Soon.",
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: "```diff\n- Map image is currently unavailable for the following reason: the map is not yet drawn.```",
                    inline: false,
                },
            );
    }
}

module.exports = MapDb;