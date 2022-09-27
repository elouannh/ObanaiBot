const RPGQuestObjective = require("../RPGQuestObjective");

class TrainStatistic extends RPGQuestObjective {
    constructor(lang, id) {
        super(lang, id, "trainStatistic");
    }
}

module.exports = TrainStatistic;