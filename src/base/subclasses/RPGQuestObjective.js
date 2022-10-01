const RPGAssetBase = require("./RPGAssetBase");

class RPGQuestObjective extends RPGAssetBase {
    constructor(lang, id, questObjectiveDatas) {
        super(lang, id);

        this.data = {
            type: questObjectiveDatas.type,
            additionalData: questObjectiveDatas.additionalData,
            completed: questObjectiveDatas.completed,
            rewardsCollected: questObjectiveDatas.rewardsCollected,
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