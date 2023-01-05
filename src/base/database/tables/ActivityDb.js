const SQLiteTable = require("../../SQLiteTable");
const ActivityData = require("../dataclasses/ActivityData");
const ActivityListener = require("../listeners/ActivityListener");
const { EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        training: {
            currentlyTraining: false,
            startedDate: 0,
            statistic: null,
        },
        travel: {
            currentlyTraveling: false,
            startedDate: 0,
            departurePoint: {
                regionId: null,
                areaId: null,
            },
            destination: {
                regionId: null,
                areaId: null,
            },
        },
        forge: {
            blacksmith: {
                forgedWeapons: 0,
                rank: "0",
            },
            forgingSlots: {
                "0": {
                    id: "0",
                    startedDate: 0,
                    currentlyForging: false,
                    weapon: {
                        "id": null,
                        "rarity": null,
                    },
                },
                "1": {
                    id: "1",
                    startedDate: 0,
                    currentlyForging: false,
                    weapon: {
                        "id": null,
                        "rarity": null,
                    },
                },
                "2": {
                    id: "2",
                    startedDate: 0,
                    currentlyForging: false,
                    weapon: {
                        "id": null,
                        "rarity": null,
                    },
                },
            },
        },
    };
}

class ActivityDb extends SQLiteTable {
    constructor(client) {
        super(client, "activity", schema, ActivityListener);
    }

    async load(id) {
        return new ActivityData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }

    /**
     * @typedef {Object} ForgeResource
     * @property {RPGMaterial} instance The material instance
     * @property {Number} amount The amount of the material
     */
    /**
     * Set a forge active. Removes also the material from the inventory.
     * @param {String} id The user ID
     * @param {String} weaponType The weapon type
     * @param {String} rarityId The rarity ID
     * @param {ForgeResource[]} resources The resources to remove for the forge
     * @returns {boolean}
     */
    forgeWeapon(id, weaponType, rarityId, resources) {
        const data = this.get(id);
        let freeSlotId = null;

        for (const key in data.forge.forgingSlots) {
            if (data.forge.forgingSlots[key].currentlyForging === false) {
                freeSlotId = key;
                break;
            }
        }

        if (freeSlotId === null) return false;

        for (const resource of resources) {
            this.client.inventoryDb.removeMaterial(id, resource.instance.id, resource.amount);
        }

        this.set(
            id,
            {
                id,
                startedDate: Date.now(),
                currentlyForging: true,
                weapon: {
                    "id": weaponType,
                    "rarity": rarityId,
                },
            },
            `forge.forgingSlots.${freeSlotId}`,
        );
        return true;
    }

    /**
     * Get the embed of the player profile.
     * @param {Object} lang The language object
     * @param {ActivityData} data The inventory data
     * @param {User} user The user
     * @returns {Promise<EmbedBuilder>}
     */
    async getEmbed(lang, data, user) {
        const embed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Player} ⟫ `
                + lang.rpgAssets.embeds.activityTitle.replace("%PLAYER", `\`${user.tag}\``),
            )
            .setColor(this.client.enums.Colors.Blurple)
            .addFields(
                {
                    name: lang.rpgAssets.concepts.training,
                    value: data.training === null ? lang.rpgAssets.embeds.noTraining
                        : `${data.training.statistic.name}, `
                        + `${lang.rpgAssets.concepts.level} **${data.training.statistic.level}** \`>\` `
                        + `${lang.rpgAssets.concepts.level} **${data.training.statistic.level + 1}**`
                        + `\n__${lang.rpgAssets.embeds.ending}:__ `
                        + `<t:${(data.training.endedDate / 1000).toFixed(0)}:R>`,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.travel,
                    value: data.travel === null ? lang.rpgAssets.embeds.noTravel
                        : `__${lang.rpgAssets.embeds.circuit}__: `
                        + `[**${data.travel.departurePoint.region.name}**, ${data.travel.departurePoint.area.name}] `
                        + `\`>\` [**${data.travel.destination.region.name}**, ${data.travel.destination.area.name}]`
                        + `\n__${lang.rpgAssets.embeds.ending}:__ `
                        + `<t:${(data.travel.endedDate / 1000).toFixed(0)}:R>`,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: false },
            );

        for (let i = 0; i < 3; i++) {
            console.log(data.forge.forgingSlots);
            if (data.forge.forgingSlots.freeSlots.map(e => e.id).includes(String(i))) {
                embed.addFields(
                    {
                        name: `${lang.rpgAssets.concepts.forge} - ${lang.rpgAssets.embeds.place} ${i + 1}`,
                        value: `*${lang.rpgAssets.embeds.freeSlot}*`,
                        inline: true,
                    },
                );
            }
            else {
                const slot = data.forge.forgingSlots.occupiedSlots[i];
                embed.addFields(
                    {
                        name: `${lang.rpgAssets.concepts.forge} - ${lang.rpgAssets.embeds.place} ${i + 1}`,
                        value: `__${lang.rpgAssets.embeds.ending}:__ <t:${(slot.endedDate / 1000).toFixed(0)}:R>`
                            + `\n__${lang.rpgAssets.concepts.weapon}:__ \`${slot.weapon.name}\` - **${slot.weapon.rarityName}**`,
                        inline: true,
                    },
                );
            }
        }

        return embed;
    }
}

module.exports = ActivityDb;