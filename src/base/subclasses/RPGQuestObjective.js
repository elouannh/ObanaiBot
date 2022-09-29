const RPGAssetBase = require("./RPGAssetBase");

class RPGQuestObjective extends RPGAssetBase {
    constructor(lang, id, type) {
        const objectives = {
            trainStatistic: require("./rpg_quest_objectives/TrainStatistic"),
        };
        super(lang, id);

        this.data = {
            type,
            objective: objectives[type],
        };

        this.overwrite();
    }

    overwrite() {
        Object.assign(this, this.data.objective);
    }
}

module.exports = RPGQuestObjective;