const TableDatas = require("./TableDatas");

class ActivityDatas extends TableDatas {
    constructor(client, activityDatas, lang) {
        super(client, activityDatas);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        if (this.datas.training.currentlyTraining) {
            this.datas.training.statistic = this.client.RPGAssetsManager.getStatistic(
                this.lang,
                this.datas.training.statistic,
                this.client.playerDb.get(this.datas.id).statistics[this.datas.training.statistic],
            );
            this.datas.training.endedDate = this.datas.training.startedDate
                + this.datas.training.statistic.statisticTrainingTimeForNextLevel;
        }
        else {
            this.datas.training = null;
        }
        if (this.datas.travel.currentlyTraveling) {
            const departurePointRegion = this.client.RPGAssetsManager.getMapRegion(
                this.lang, this.datas.travel.departurePoint.region,
            );
            this.datas.travel.departurePoint = {
                region: departurePointRegion,
                area: departurePointRegion.getArea(this.datas.travel.departurePoint.area),
            };

            const destinationRegion = this.client.RPGAssetsManager.getMapRegion(
                this.lang, this.datas.travel.destination.regionId,
            );
            this.datas.travel.destination = {
                region: destinationRegion,
                area: destinationRegion.getArea(this.datas.travel.destination.areaId),
            };

            delete this.datas.travel.destination.regionId;
            delete this.datas.travel.destination.areaId;

            this.datas.travel.distance = departurePointRegion.getDistanceTo(destinationRegion)
                + destinationRegion.arrivalArea.getDistanceTo(
                    destinationRegion.getArea(this.datas.travel.destination.area.id),
                );

            this.datas.travel.endedDate = this.client.util.round(
                this.datas.travel.startedDate
                + (this.datas.travel.distance * this.client.config.rpg.minutesPerDistanceUnit * 60 * 1000)
            );
        }
        else {
            this.datas.travel = null;
        }

        const forgingSlots = {
            occupiedSlots: [],
            freeSlots: [],
        };
        for (const forgeId in this.datas.forge.forgingSlots) {
            if (this.datas.forge.forgingSlots[forgeId].currentlyForging) {
                forgingSlots.occupiedSlots.push({
                    id: forgeId,
                    startedDate: this.datas.forge.forgingSlots[forgeId].startedDate,
                    endedDate: this.datas.forge.forgingSlots[forgeId].startedDate
                        + this.client.config.rpg.minutesOfForgingPerRarity
                        * this.datas.forge.forgingSlots[forgeId].weapon.rarity * 60 * 1000,
                    currentlyForging: this.datas.forge.forgingSlots[forgeId].currentlyForging,
                    weapon: this.client.RPGAssetsManager.getWeapon(
                        this.lang,
                        this.datas.forge.forgingSlots[forgeId].weapon.id,
                        this.datas.forge.forgingSlots[forgeId].weapon.rarity,
                    ),
                });
            }
            else {
                forgingSlots.freeSlots.push({ id: forgeId });
            }
        }
        this.datas.forge.forgingSlots = forgingSlots;
    }
}

module.exports = ActivityDatas;