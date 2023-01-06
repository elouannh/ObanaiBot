const RPGAssetBase = require("./RPGAssetBase");
const RPGQuestObjective = require("./RPGQuestObjective");
const RPGQuestReward = require("./RPGQuestReward");

class RPGQuest extends RPGAssetBase {
    constructor(lang, id, questData) {
        super(lang, id);

        this.name = this.lang.json.quests[this.id].name;
        this.label = this.lang.json.quests[this.id].label;
        this.description = this.lang.json.quests[this.id].description;
        this.wattpad = this.lang.json.quests[this.id].wattpad;
        this.objectives = Object.values(questData.objectives).map(obj => new RPGQuestObjective(this.lang.json.quests[this.id], obj.id, obj));
        this.rewards = Object.values(questData.rewards).map(reward => new RPGQuestReward(this.lang, reward.id, reward));
    }
}

module.exports = RPGQuest;