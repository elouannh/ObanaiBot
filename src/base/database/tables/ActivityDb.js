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
                districtId: null,
                sectorId: null,
            },
            destination: {
                districtId: null,
                sectorId: null,
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

    get(id) {
        const data = super.get(id);
        const langId = this.client.playerDb.getLang(id);
        const lang = this.client.languageManager.getLang(langId).json;

        if (data.training.currentlyTraining) {
            const levelToReach = this.client.playerDb.get(id).statistics[data.training.statistic] + 1;
            const trainingTime = this.client.RPGAssetsManager.statistics.trainingTimes[String(levelToReach)];
            const timeLeft = trainingTime - (Date.now() - data.training.startedDate);

            if (timeLeft <= 0) {
                this.client.playerDb.upgradeStatistic(id, data.training.statistic);
                this.set(
                    id, {
                        currentlyTraining: false,
                        startedDate: 0,
                        statistic: null,
                    },
                    "training",
                );
                const exp = this.client.playerDb.addExp(id, Number(levelToReach));
                const embed = new EmbedBuilder()
                    .setTitle(lang.rpgAssets.trainingCompletedTitle)
                    .setDescription(lang.rpgAssets.trainingCompleted
                        .replace("%STAT", data.training.statistic.name)
                        .replace("%LEVEL", levelToReach)
                        .replace("%EXP", exp),
                    )
                    .setColor(this.client.enums.Colors.Green);
                this.client.notify(id, { embeds: [embed] });
                data.training = {
                    currentlyTraining: false,
                    startedDate: 0,
                    statistic: null,
                };
            }
        }
        if (data.travel.currentlyTraveling) {
            const departure = this.client.RPGAssetsManager.getMapDistrict(
                langId, data.travel.departurePoint.districtId,
            );
            const departureSector = departure.getSector(data.travel.departurePoint.sectorId);
            const destination = this.client.RPGAssetsManager.getMapDistrict(
                langId, data.travel.destination.districtId,
            );
            const destinationSector = destination.getSector(data.travel.destination.sectorId);
            const distance = this.distance(departure, departureSector, destination, destinationSector);
            const endedDate = this.client.util.round(data.travel.startedDate
                + this.client.activityDb.distanceToTime(distance),
            );
            const timeLeft = endedDate - Date.now();

            if (timeLeft <= 0) {
                this.client.mapDb.move(id, destination.id, destinationSector.id);
                this.set(
                    id,
                    {
                        currentlyTraveling: false,
                        startedDate: 0,
                        departurePoint: {
                            districtId: null,
                            sectorId: null,
                        },
                        destination: {
                            districtId: null,
                            sectorId: null,
                        },
                    },
                    "travel",
                );
                const exp = this.client.playerDb.addExp(id, distance);
                const embed = new EmbedBuilder()
                    .setTitle(lang.rpgAssets.embeds.travelCompletedTitle)
                    .setDescription(lang.rpgAssets.embeds.travelCompleted
                        .replace("%OLD", `${departure.name} - ${departureSector.name}`)
                        .replace("%NEW", `${destination.name} - ${destinationSector.name}`)
                        .replace("%EXP", exp),
                    )
                    .setColor(this.client.enums.Colors.Green);
                this.client.notify(id, { embeds: [embed] });
                data.travel = {
                    currentlyTraveling: false,
                    startedDate: 0,
                    departurePoint: {
                        districtId: null,
                        sectorId: null,
                    },
                    destination: {
                        districtId: null,
                        sectorId: null,
                    },
                };
            }
        }

        const blacksmith = this.client.RPGAssetsManager.loadBlacksmith(
            langId, data.forge.blacksmith,
        );
        const finishedWeapons = [];
        for (const forgingSlot in data.forge.forgingSlots) {
            const slotData = data.forge.forgingSlots[forgingSlot];
            if (!slotData.currentlyForging) continue;

            const endedDate = slotData.startedDate
                + blacksmith.timePerRarity * (Number(slotData.weapon.rarity) + 1) * 60 * 1000;
            const timeLeft = endedDate - Date.now();

            if (timeLeft <= 0) {
                const weaponData = slotData.weapon;
                const weapon = this.client.RPGAssetsManager.getWeapon(langId, weaponData.id, weaponData.rarity);
                finishedWeapons.push(weapon);
                this.client.inventoryDb.addWeapon(id, weapon.id, weapon.rarity, 1);
                data.forge.forgingSlots[forgingSlot] = {
                    id: "0",
                    startedDate: 0,
                    currentlyForging: false,
                    weapon: {
                        "id": null,
                        "rarity": null,
                    },
                };
                this.set(id, data.forge.forgingSlots, "forge", "forgingSlots");
            }
        }
        if (finishedWeapons.length > 0) {
            const form = lang.rpgAssets.embeds.forgeCompleted.split("\n\n")[1];
            const embed = new EmbedBuilder()
                .setTitle(lang.rpgAssets.embeds.forgeCompletedTitle)
                .setDescription(
                    lang.rpgAssets.embeds.forgeCompleted.split("\n\n")[0]
                    + "\n\n"
                    + finishedWeapons.map(w =>
                        form
                            .replace("%WEAPONS_NAME", w.name)
                            .replace("%WEAPONS_RARITY_NAME", w.rarityName),
                    ).join("\n"),
                )
                .setColor(this.client.enums.Colors.Green);
            this.client.notify(id, { embeds: [embed] });
        }

        return data;
    }

    /**
     * Functions that calculate the distance between a departure and a destination and returns the units.
     * @param {Object} departure The departure district
     * @param {Object} destination The destination district
     * @param {Object} departureSector The departure sector
     * @param {Object} destinationSector The destination sector
     * @returns {Number} The distance between the departure and the destination
     */
    distance(departure, destination, departureSector, destinationSector) {
        let distance = 0;
        if (departure.id === destination.id) {
            distance = this.client.RPGAssetsManager.getSectorsDistance(departureSector, destinationSector);
        }
        else {
            distance = this.client.RPGAssetsManager.getDistrictsDistance(
                { district: departure, sector: departureSector },
                { district: destination, sector: destinationSector },
            );
        }
        return distance;
    }

    /**
     * Function that convert the distance to time in milliseconds.
     * @param {Number} distance The distance
     * @returns {Number} The time in milliseconds
     */
    distanceToTime(distance) {
        return distance * this.client.enums.Units.MinutesPerDistanceUnit * 60 * 1000;
    }

    /**
     * Function that starts travel to the specified destination.
     * @param {String} id The user ID
     * @param {Number} startedDate The time when the travel started
     * @param {String} departureDistrictId The departure district ID
     * @param {String} departureSectorId The departure sector ID
     * @param {String} destinationDistrictId The destination district ID
     * @param {String} destinationSectorId The destination sector ID
     */
    async travel(id, startedDate, departureDistrictId, departureSectorId, destinationDistrictId, destinationSectorId) {
        this.set(
            id,
            {
                currentlyTraveling: true,
                startedDate,
                departurePoint: {
                    districtId: departureDistrictId,
                    sectorId: departureSectorId,
                },
                destination: {
                    districtId: destinationDistrictId,
                    sectorId: destinationSectorId,
                },
            },
            "travel",
        );
    }

    /**
     * Function that starts a training.
     * @param {String} id The user ID
     * @param {String} statisticId The statistic ID
     * @param {Number} startedDate The time when the training started
     * @returns {void}
     */
    train(id, statisticId, startedDate) {
        this.set(
            id,
            {
                currentlyTraining: true,
                startedDate,
                statistic: statisticId,
            },
            "training",
        );
    }

    /**
     * @typedef {Object} ForgeResource
     * @property {String} id The material id
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
            this.client.inventoryDb.removeMaterial(id, resource.id, resource.amount);
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
                        + `[**${data.travel.departurePoint.district.name}**, ${data.travel.departurePoint.sector.name}] `
                        + `\`>\` [**${data.travel.destination.district.name}**, ${data.travel.destination.sector.name}]`
                        + `\n__${lang.rpgAssets.embeds.ending}:__ `
                        + `<t:${(data.travel.endedDate / 1000).toFixed(0)}:R>`,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: false },
            );

        for (let i = 0; i < 3; i++) {
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