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
            const departurePointDistrict = this.client.RPGAssetsManager.getMapDistrict(
                this.lang, this.data.travel.departurePoint.districtId,
            );
            this.data.travel.departurePoint = {
                district: departurePointDistrict,
                sector: departurePointDistrict.getSector(this.data.travel.departurePoint.sectorId),
            };

            const destinationDistrict = this.client.RPGAssetsManager.getMapDistrict(
                this.lang, this.data.travel.destination.districtId,
            );
            this.data.travel.destination = {
                district: destinationDistrict,
                sector: destinationDistrict.getSector(this.data.travel.destination.sectorId),
            };

            delete this.data.travel.departurePoint.districtId;
            delete this.data.travel.departurePoint.sectorId;
            delete this.data.travel.destination.districtId;
            delete this.data.travel.destination.sectorId;

            this.data.travel.distance = this.client.activityDb.distance(
                this.data.travel.departurePoint.district,
                this.data.travel.destination.district,
                this.data.travel.departurePoint.sector,
                this.data.travel.destination.sector,
            );

            this.data.travel.endedDate = this.client.util.round(this.data.travel.startedDate
                + (this.data.travel.distance * this.client.enums.Units.MinutesPerDistanceUnit * 60 * 1000),
            );
        }
        else {
            this.data.travel = null;
        }

        this.data.forge.blacksmith = this.client.RPGAssetsManager.loadBlacksmith(this.lang, this.data.forge.blacksmith);
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
                        + this.data.forge.blacksmith.timePerRarity
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