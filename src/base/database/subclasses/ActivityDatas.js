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
            this.datas.training.endedDate = this.datas.training.startedDate + this.datas.training.statistic.statisticTrainingTimeForNextLevel;
        }
        else {
            this.datas.training = null;
        }
        if (this.datas.travel.currentlyTraveling) {
            const departurePointRegion = this.client.RPGAssetsManager.getMapRegion(this.lang, this.datas.travel.departurePoint.region);
            this.datas.travel.destination = {
                departurePointRegion,
                area: departurePointRegion.getArea(this.datas.travel.departurePoint.area),
            };

            const destinationRegion = this.client.RPGAssetsManager.getMapRegion(this.lang, this.datas.travel.destination.region);
            this.datas.travel.destination = {
                destinationRegion,
                area: destinationRegion.getArea(this.datas.travel.destination.area),
            };

            this.datas.travel.distance = departurePointRegion.getDistanceTo(destinationRegion)
                + destinationRegion.arrivalArea.getDistanceTo(destinationRegion.getArea("0"));

            this.datas.travel.endedDate = this.datas.travel.startedDate + (this.datas.travel.distance * this.client.config.rpg.minutesPerUnitDistance);
        }
        else {
            this.datas.travel = null;
        }
        for (const forgeId in this.datas.forge.forgingSlots) {
            const forge = this.datas.forge.forgingSlots[forgeId];
            if (forge.weapon.id !== null) {
                const weapon = this.client.RPGAssetsManager.getWeapon(this.lang, forge.weapon.id, forge.weapon.rarity);
                forge.weapon.rarity = weapon.rarity;
            }
        }
    }
}

module.exports = ActivityDatas;