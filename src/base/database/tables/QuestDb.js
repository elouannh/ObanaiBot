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

    async refreshQuestObjectives(id, objectives) {
        const newlyAccomplished = [];
        const userData = {};

        for (let i = 0; i < objectives.length; i++) {
            const o = objectives[i];
            let completedInDepth = false;

            switch (o.type) {
                case "reachStatisticLevel":
                    if (!("player" in userData)) userData["player"] = await this.client.playerDb.load(id);

                    const statistic = o.additionalData.statistic;
                    const userStatistic = userData["player"].statistics[statistic];

                    if (userStatistic.level >= o.additionalData.levelToReach) completedInDepth = true;
                    break;
                case "reachDestination":
                    if (!("map" in userData)) userData["map"] = await this.client.mapDb.load(id);

                    const { region, area } = o.additionalData;
                    const userRegion = userData["map"].region;
                    const userArea = userData["map"].region;

                    if (userRegion.id === region && userArea.id === area) completedInDepth = true;
                    break;
                case "haveMoney":
                    if (!("inventory" in userData)) userData["inventory"] = await this.client.inventoryDb.load(id);

                    const userMoney = userData["inventory"].wallet;

                    if (userMoney >= o.additionalData.amountToReach) completedInDepth = true;
                    break;
                case "haveExperience":
                    if (!("player" in userData)) userData["player"] = await this.client.playerDb.load(id);

                    const userExperience = userData["player"].level;

                    if (userExperience.exp >= o.additionalData.amountToReach) completedInDepth = true;
                    break;
                case "haveKasugaiCrowExperience":
                    if (!("inventory" in userData)) userData["inventory"] = await this.client.inventoryDb.load(id);

                    const userKasugaiCrowExperience = userData["inventory"].kasugaiCrow.exp;

                    if (userKasugaiCrowExperience >= o.additionalData.amountToReach) completedInDepth = true;
                    break;
                default:
                    break;
            }

            if (completedInDepth) {
                this.setSlayerQuestObjectiveAccomplished(id, String(i));
                newlyAccomplished.push(i);
            }
        }

        return newlyAccomplished;
    }

    async getQuestRewards(id, objectiveIds, objectives, rewards) {
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

    async refreshSlayerQuestObjectives(id) {
        const userQuestData = await this.load(id);
        if (userQuestData.schemaInstance) return;

        const slayerQuest = userQuestData.currentQuests.slayerQuest[0];
        if (slayerQuest === null) return;

        const objectives = slayerQuest.objectives;
        await this.refreshQuestObjectives(id, objectives);
    }

    async getSlayerQuestRewards(id, objectiveIds) {
        const userQuestData = await this.load(id);
        if (userQuestData.schemaInstance) return;

        const slayerQuest = userQuestData.currentQuests.slayerQuest[0];
        if (slayerQuest === null) return;

        const [objectives, rewards] = [slayerQuest.objectives, slayerQuest.rewards];
        await this.getQuestRewards(id, objectiveIds, objectives, rewards);
    }

    async updateSlayerQuest(id) {
        const refreshSlayerQuestObjectives = await this.refreshSlayerQuestObjectives(id);
        if (refreshSlayerQuestObjectives.length > 0) {
            await this.getSlayerQuestRewards(id, refreshSlayerQuestObjectives);
        }
    }
}

module.exports = QuestDb;