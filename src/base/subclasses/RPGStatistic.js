const RPGAssetBase = require("./RPGAssetBase");
const Util = require("../Util");

class RPGStatistic extends RPGAssetBase {
    constructor(lang, id, statisticLevel, statisticTrainingTimeForNextLevel) {
        super(lang, id);

        this.util = new Util(null);
        this.name = this.lang.json.names[this.id];
        this.level = statisticLevel;
        this.amount = this.util.round(this.level * 10);
        this.grimoireBoost = [0, 0];
        this.statisticTrainingTimeForNextLevel = this.level === 100 ? this.lang.json.levels.max : statisticTrainingTimeForNextLevel * 60 * 1000;
    }

    setGrimoireBoost(strength) {
        this.grimoireBoost[0] = this.util.round(this.amount * strength);
        this.grimoireBoost[1] = this.util.round((strength - 1) * 100);
    }

    get finalAmount() {
        return this.util.round(this.amount + this.grimoireBoost[0]);
    }

    get fightAmount() {
        return this.util.round(
            this.client.util.round(this.finalAmount / 30, 0) * 10,
            0,
        );
    }
}

module.exports = RPGStatistic;