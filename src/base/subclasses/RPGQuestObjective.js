const RPGAssetBase = require("./RPGAssetBase");

class RPGQuestObjective extends RPGAssetBase {
    constructor(lang, id, questObjectiveData) {
        super(lang, id);

        this.name = this.lang.objectives[this.id];
        this.type = questObjectiveData.type;
        this.additionalData = questObjectiveData.additionalData;
    }
}

module.exports = RPGQuestObjective;