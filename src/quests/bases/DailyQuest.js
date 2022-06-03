const QuestBase = require("./QuestBase");

class DailyQuest extends QuestBase {
    constructor(title, description, objective, id, step) {
        super(title, description, objective, "daily", id, step);
    }
}

module.exports = DailyQuest;