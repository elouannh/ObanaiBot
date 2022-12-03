const RPGAssetBase = require("./RPGAssetBase");
const RPGQuestObjective = require("./RPGQuestObjective");

class RPGQuest extends RPGAssetBase {
    constructor(lang, id, questData) {
        super(lang, id);

        this.name = this.lang.json[this.id].name;
        this.label = this.lang.json[this.id].label;
        this.objectives = Object.values(questData.objectives).map(obj => new RPGQuestObjective(this.lang.json[this.id], obj.id));
    }
}

module.exports = RPGQuest;