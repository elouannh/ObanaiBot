const QuestBase = require("./QuestBase");

class SlayerQuest extends QuestBase {
    constructor(title, description, objective, id, chapter, quest, step) {
        super(title, description, objective, "slayer", id, step);

        this.chapter = chapter;
        this.quest = quest;
    }
}

module.exports = SlayerQuest;