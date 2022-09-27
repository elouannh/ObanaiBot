const RPGAssetBase = require("./RPGAssetBase");
const TrainStatistic = require("./rpg_quest_objectives/TrainStatistic");

const objectives = {
    trainStatistic: TrainStatistic,
};

class RPGQuestObjective extends RPGAssetBase {
    constructor(lang, id, type) {
        super(lang, id);


        this.data = {
            type,
            objective: objectives[type],
        };

        this.overwrite();
    }

    overwrite() {
        const data = this.data;
        for (const key in this) {
            if (typeof this[key] !== "function") delete this[key];
        }
        Object.assign(this, data);
    }
}

module.exports = RPGQuestObjective;