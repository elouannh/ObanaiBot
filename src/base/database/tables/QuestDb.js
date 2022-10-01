const SQLiteTable = require("../../SQLiteTable");
const QuestData = require("../dataclasses/QuestData");

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
            tome: 0,
            arc: 0,
            quest: 0,
        },
    };
}

class QuestDb extends SQLiteTable {
    constructor(client) {
        super(client, "quest", schema);
    }

    async load(id) {
        return new QuestData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }

    setSlayerQuest(id, tome, arc, quest, branch = "main") {
        const slayerQuestId = `slayer.${tome}.${arc}.${quest}`;
        const questData = this.client.RPGAssetsManager.getQuest(this.client.playerDb.getLang(id), slayerQuestId);

        const questObject = {
            id: slayerQuestId,
            objectives: {},
        };

        for (let i = 0; i < questData.objectives.length; i++) {
            questObject.objectives[String(i)] = {
                "completed": false,
                "rewardsCollected": false,
                "additionalData": {},
            };
        }

        this.set(
            id,
            questObject,
            `currentQuests.slayerQuest.${branch}`,
        );
    }
}

module.exports = QuestDb;