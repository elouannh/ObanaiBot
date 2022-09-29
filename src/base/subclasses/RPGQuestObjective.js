const RPGAssetBase = require("./RPGAssetBase");

class RPGQuestObjective extends RPGAssetBase {
    constructor(lang, id, questObjectiveDatas) {
        const objectives = {
            trainStatistic: require("./rpg_quest_objectives/TrainStatistic"),
        };
        super(lang, id);

        this.data = {
            type: questObjectiveDatas.type,
            objective: objectives[questObjectiveDatas.type],
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