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

    setDailyQuest(id, questId, branch = "0") {
        const dailyQuestId = `daily.${questId}`;
        const dailyQuest = this.client.RPGAssetsManager.getQuest(this.client.playerDb.getLang(id), dailyQuestId);

        this.set(
            id,
            dailyQuest,
            `currentQuests.dailyQuests.${branch}`,
        );
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

    setSlayerQuestObjectiveAccomplished(id, objectiveId) {
        this.set(
            id,
            true,
            `currentQuests.slayerQuest.main.objectives.${objectiveId}.completed`,
        );
    }

    setSlayerQuestRewardCollected(id, objectiveId) {
        this.set(
            id,
            true,
            `currentQuests.slayerQuest.main.objectives.${objectiveId}.rewardsCollected`,
        );
    }

    async refreshSlayerQuestObjectives(id) {
        const userQuestData = await this.load(id);
        if (userQuestData.schemaInstance) return;

        const slayerQuest = userQuestData.currentQuests.slayerQuest[0];
        if (slayerQuest === null) return;

        const objectives = slayerQuest.objectives;
        const newlyAccomplished = [];

        const userData = {};

        for (let i = 0; i < objectives.length; i++) {
            const o = objectives[i];
            let completedInDepth = false;

            switch (o.type) {
                case "trainStatistic":
                    if (!("player" in userData)) userData["player"] = await this.client.playerDb.load(id);

                    const statistic = o.additionalData.statistic;
                    const userStatistic = userData["player"].statistics[statistic];

                    if (userStatistic.level >= o.additionalData.levelToReach) {
                        completedInDepth = true;
                        this.setSlayerQuestObjectiveAccomplished(id, String(i));
                    }
                    break;
                default:
                    break;
            }

            if (completedInDepth) newlyAccomplished.push(i);
        }

        return newlyAccomplished;
    }

    async getSlayerQuestRewards(id, objectiveIds) {
        const userQuestData = await this.load(id);
        if (userQuestData.schemaInstance) return;

        const slayerQuest = userQuestData.currentQuests.slayerQuest[0];
        if (slayerQuest === null) return;

        const [objectives, rewards] = [slayerQuest.objectives, slayerQuest.rewards];
        for (let i = 0; i < objectives.length; i++) {
            const o = objectives[i];
            const r = rewards[i];

            if (o.user.rewardsCollected) continue;
            if (!o.user.completed) continue;

            if (objectiveIds.includes(i)) {
                for (const reward of r) {
                    switch (reward.type) {
                        case "exp":
                            this.client.inventoryDb.addMoney(id, reward.amount);
                            break;
                        default:
                            break;
                    }
                }
                this.setSlayerQuestRewardCollected(id, String(i));
            }
        }
    }

    async updateSlayerQuest(id) {
        const refreshSlayerQuestObjectives = await this.refreshSlayerQuestObjectives(id);
        if (refreshSlayerQuestObjectives.length > 0) {
            await this.getSlayerQuestRewards(id, refreshSlayerQuestObjectives);
        }
    }
}

module.exports = QuestDb;