const RPGAssetBase = require("./RPGAssetBase");

class RPGQuestObjective extends RPGAssetBase {
    constructor(lang, id, questObjectiveDatas) {
        const objectives = {
            trainStatistic: require("./rpg_quest_objectives/TrainStatistic"),
        };
        super(lang, id);

        this.data = {
            type: questObjectiveDatas.type,
            additionalData: questObjectiveDatas.additionalData,
            completed: questObjectiveDatas.completed,
        };

        this.overwrite();
        this.objectiveData = new objectives[questObjectiveDatas.type](lang, id, this);
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