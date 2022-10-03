/* eslint-disable no-case-declarations */
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

    setDailyQuest(id, questId, branch = "0") {
        const dailyQuestId = `daily.${questId}`;
        const dailyQuest = this.client.RPGAssetsManager.getQuest(this.client.playerDb.getLang(id), dailyQuestId);

        this.set(
            id,
            dailyQuest,
            `currentQuests.dailyQuests.${branch}`,
        );
    }

    async refreshSlayerQuestObjectives(id) {
        const userQuestData = await this.load(id);
        if (userQuestData.schemaInstance) return;

        const slayerQuest = userQuestData.currentQuests.slayerQuest[0];
        if (slayerQuest === null) return;

        const objectives = slayerQuest.objectives;
        const accomplishedObjectives = {
            "alreadyAccomplished": [],
            "newlyAccomplished": [],
            "notYetCompleted": [],
        };

        const userData = {};

        for (let i = 0; i < objectives.length; i++) {
            const o = objectives[i];
            let completedInDepth = false;

            switch (o.type) {
                case "trainStatistic":
                    if (!("player" in userData)) userData["player"] = await this.client.playerDb.load(id);

                    const statistic = o.additionalData.statistic;
                    const userStatistic = userData["player"].statistics[statistic];

                    if (userStatistic >= o.additionalData.levelToReach) completedInDepth = true;
                    break;
                default:
                    break;
            }

            const binaryCondition = `0b${Number(o.user.completed)}${Number(completedInDepth)}`;
            switch (binaryCondition) {
                case "0b00":
                    accomplishedObjectives.notYetCompleted.push(i);
                    break;
                case "0b01":
                    accomplishedObjectives.newlyAccomplished.push(i);
                    break;
                case "0b10":
                case "0b11":
                    accomplishedObjectives.alreadyAccomplished.push(i);
                    break;
                default:
                    break;
            }

        }
    }
}

module.exports = QuestDb;