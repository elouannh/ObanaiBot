const RPGAssetBase = require("./RPGAssetBase");
const RPGQuestObjective = require("./RPGQuestObjective");

class RPGQuest extends RPGAssetBase {
    constructor(lang, id, questData) {
        super(lang, id);

        console.log(Object.entries(questData.objectives).map(([key, value]) => [key, value]));

        this.questData = {
            id: questData.id,
            tome: questData.tome ?? null,
            arc: questData.arc ?? null,
            quest: questData.quest ?? null,
            objectives: Object.entries(questData.objectives).map(([key, value]) => new RPGQuestObjective(this.lang, key, value)),
            rewards: questData.rewards,
        };

        this.overwrite();
    }

    overwrite() {
        const data = this.questData;
        for (const key in this) {
            if (typeof this[key] !== "function") delete this[key];
        }
        Object.assign(this, data);
    }
}

module.exports = RPGQuest;