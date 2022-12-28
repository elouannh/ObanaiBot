const TableData = require("../../TableData");

class ActivityData extends TableData {
    constructor(client, activityData, lang) {
        super(client, activityData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        if (this.data.training.currentlyTraining) {
            this.data.training.statistic = this.client.RPGAssetsManager.getStatistic(
                this.lang,
                this.data.training.statistic,
                this.client.playerDb.get(this.data.id).statistics[this.data.training.statistic],
            );
            this.data.training.endedDate = this.data.training.startedDate
                + this.data.training.statistic.statisticTrainingTimeForNextLevel;
        }
        else {
            this.data.training = null;
        }
        if (this.data.travel.currentlyTraveling) {
            const departurePointRegion = this.client.RPGAssetsManager.getMapRegion(
                this.lang, this.data.travel.departurePoint.regionId,
            );
            this.data.travel.departurePoint = {
                region: departurePointRegion,
                area: departurePointRegion.getArea(this.data.travel.departurePoint.areaId),
            };

            const destinationRegion = this.client.RPGAssetsManager.getMapRegion(
                this.lang, this.data.travel.destination.regionId,
            );
            this.data.travel.destination = {
                region: destinationRegion,
                area: destinationRegion.getArea(this.data.travel.destination.areaId),
            };

            delete this.data.travel.departurePoint.regionId;
            delete this.data.travel.departurePoint.areaId;
            delete this.data.travel.destination.regionId;
            delete this.data.travel.destination.areaId;

            this.data.travel.distance = departurePointRegion.getDistanceTo(destinationRegion)
                + destinationRegion.arrivalArea.getDistanceTo(
                    this.data.travel.destination.area,
                );

            this.data.travel.endedDate = this.client.util.round(
                this.data.travel.startedDate
                + (this.data.travel.distance * this.client.enums.Units.MinutesPerDistanceUnit * 60 * 1000),
            );
        }
        else {
            this.data.travel = null;
        }

        const forgingSlots = {
            occupiedSlots: [],
            freeSlots: [],
        };
        for (const forgeId in this.data.forge.forgingSlots) {
            if (this.data.forge.forgingSlots[forgeId].currentlyForging) {
                forgingSlots.occupiedSlots.push({
                    id: forgeId,
                    startedDate: this.data.forge.forgingSlots[forgeId].startedDate,
                    endedDate: this.data.forge.forgingSlots[forgeId].startedDate
                        + this.client.enums.Units.MinutesOfForgingPerRarity
                        * (Number(this.data.forge.forgingSlots[forgeId].weapon.rarity) + 1) * 60 * 1000,
                    currentlyForging: this.data.forge.forgingSlots[forgeId].currentlyForging,
                    weapon: this.client.RPGAssetsManager.getWeapon(
                        this.lang,
                        this.data.forge.forgingSlots[forgeId].weapon.id,
                        this.data.forge.forgingSlots[forgeId].weapon.rarity,
                    ),
                });
            }
            else {
                forgingSlots.freeSlots.push({ id: forgeId });
            }
        }
        this.data.forge.forgingSlots = forgingSlots;
    }
}

module.exports = ActivityData;