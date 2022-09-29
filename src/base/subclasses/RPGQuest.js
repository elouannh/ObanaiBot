const RPGAssetBase = require("./RPGAssetBase");

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
    }
}

module.exports = RPGQuest;