const SQLiteTable = require("../../SQLiteTable");
const QuestDatas = require("../subclasses/QuestDatas");

function schema(id) {
    return {
        id: id,
        currentQuests: {
            dailyQuests: {},
            sideQuests: {},
            slayerQuest: {},
        },
        completedQuests: {
            dailyQuests: {},
            sideQuests: {},
            slayerQuest: {},
        },
        storyProgression: {
            volume: 0,
            chapter: 0,
            quest: 0,
        },
    };
}

class QuestDb extends SQLiteTable {
    constructor(client) {
        super(client, "quest", schema);
    }

    async load(id) {
        return new QuestDatas(this.client, this.get(id), this.client.playerDb.getLang(id));
    }
}

module.exports = QuestDb;