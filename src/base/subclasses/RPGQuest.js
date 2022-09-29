const RPGAssetBase = require("./RPGAssetBase");
const RPGQuestObjective = require("./RPGQuestObjective");

class RPGQuest extends RPGAssetBase {
    constructor(lang, id, questData) {
        super(lang, id);

        this.questData = {
            id: questData.id,
            tome: questData.tome ?? null,
            arc: questData.arc ?? null,
            quest: questData.quest ?? null,
            objectives: questData.objectives,
            rewards: questData.rewards,
        };
        for (const obj in this.questData.objectives) {
            const objective = this.questData.objectives[obj];
            this.questData.objectives[obj] = new RPGQuestObjective(lang, obj, objective.type);
        }

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