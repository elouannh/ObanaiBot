const RPGAssetBase = require("./RPGAssetBase");
const RPGQuestObjective = require("./RPGQuestObjective");

class RPGQuest extends RPGAssetBase {
    constructor(lang, id, questData, userData) {
        super(lang, id);

        this.questData = {
            id: questData.id,
            tome: questData.tome ?? null,
            arc: questData.arc ?? null,
            quest: questData.quest ?? null,
            objectives: [],
            rewards: questData.rewards,
        };
        for (let objective in questData.objectives) {
            if (userData !== null) {
                const userProgress = userData.objectives[objective];
                const additionalData = Object.assign(
                    questData.objectives[objective].additionalData, userProgress.additionalData,
                );
                Object.assign(questData.objectives[objective], userProgress);
                Object.assign(questData.objectives[objective].additionalData, additionalData);
            }
            objective = questData.objectives[objective];
            this.questData.objectives.push(new RPGQuestObjective(lang, objective.type, objective));
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