const SQLiteTable = require("../../SQLiteTable");
const MapData = require("../dataclasses/MapData");
const MapListener = require("../listeners/MapListener");
const { EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        regionId: "0",
        areaId: "0",
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
            const regionExcavatedAreas = data.exploration.excavated[rKey];
            if (regionExcavatedAreas.length === 0) {
                delete data.exploration.excavated[rKey];
                this.delete(key, `exploration.excavated.${rKey}`);
                continue;
            }
            for (const [areaKey, areaDate] of regionExcavatedAreas) {
                if (this.client.util.dateToString(new Date(areaDate)) !== this.client.util.dateToString(new Date())) {
                    data.exploration.excavated[rKey].splice(regionExcavatedAreas.indexOf([areaKey, areaDate]), 1);
                    this.resetExcavation(key, rKey, areaKey);
                }
            }
        }

        return data;
    }

    /**
     * Function that moves a player on an area/region.
     * @param {String} id The user ID
     * @param {String} regionId The region ID
     * @param {String} areaId The area ID
     */
    move(id, regionId, areaId) {
        this.set(id, regionId, "regionId");
        this.set(id, areaId, "areaId");
    }

    /**
     * Set an area as already excavated.
     * @param {String} id The user ID
     * @param {String} regionId The region ID
     * @param {String} areaId The area ID
     * @returns {void}
     */
    explore(id, regionId, areaId) {
        const data = this.get(id);
        const areas = data.exploration.excavated[regionId] || [];
        if (!areas.map(e => e[0]).includes(areaId)) areas.push([areaId, Date.now()]);
        this.set(id, areas, `exploration.excavated.${regionId}`);
    }

    /**
     * Set a region and an area as none excavated.
     * @param {String} id The user ID
     * @param {String} regionId The region ID
     * @param {String} areaId The area ID
     * @returns {void}
     */
    resetExcavation(id, regionId, areaId) {
        const data = this.get(id);
        const areas = data.exploration.excavated[regionId] || [];
        if (areas.includes(areaId)) areas.splice(areas.indexOf(areaId), 1);
        this.set(id, areas, `exploration.excavated.${regionId}`);
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
                    name: lang.rpgAssets.concepts.region,
                    value: `${data.region.name}`,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.area,
                    value: `${data.area.name}\n__${lang.rpgAssets.concepts.biome}:__ **${data.area.biome.name}**`,
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