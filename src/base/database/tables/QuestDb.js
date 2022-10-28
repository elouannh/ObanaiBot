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

    /**
     * Sets the current daily quest for the user. The branch designs if it's the 1st or 2nd quest.
     * @param {String} id The user ID
     * @param {String} questId The quest ID to set
     * @param {String} branch The branch (e.g. "0" or "1")
     * @return {void}
     */
    setDailyQuest(id, questId, branch = "0") {
        const dailyQuestId = `daily.${questId}`;
        const dailyQuest = this.client.RPGAssetsManager.getQuest(this.client.playerDb.getLang(id), dailyQuestId);

        this.set(
            id,
            dailyQuest,
            `currentQuests.dailyQuests.${branch}`,
        );
    }

    /**
     * Sets the current slayer (main) quest for the user. The branch designs where the quest is located, keep "main" to avoid problems.
     * @param {String} id The user ID
     * @param {String} tome The tome ID
     * @param {String} arc The arc ID
     * @param {String} quest The quest ID to set
     * @param {String} branch The branch (set "main" to avoid problems)
     * @return {void}
     */
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

    /**
     * Functions that modify the slayer quest: mark an objective as completed.
     * @param {String} id The user ID
     * @param {String} objectiveId The objective ID of the quest
     * @return {void}
     */
    setSlayerQuestObjectiveAccomplished(id, objectiveId) {
        this.set(
            id,
            true,
            `currentQuests.slayerQuest.main.objectives.${objectiveId}.completed`,
        );
    }

    /**
     * Functions that modify the slayer quest: set that the rewards for a completed objective has been collected.
     * @param {String} id The user ID
     * @param {String} objectiveId The objective ID of the quest
     * @return {void}
     */
    setSlayerQuestRewardCollected(id, objectiveId) {
        this.set(
            id,
            true,
            `currentQuests.slayerQuest.main.objectives.${objectiveId}.rewardsCollected`,
        );
    }

    /**
     * Verify if the user has completed the objectives of a quest, and returns the completed objectives.
     * It sets the objectives as completed if they are directly with this.setSlayerQuestObjectiveAccomplished method.
     * @param {String} id The user ID
     * @param {Object[]} objectives The list of objectives
     * @returns {Promise<String[]>} The list of completed objectives ids
     */
    async refreshQuestObjectives(id, objectives) {
        const newlyAccomplished = [];
        const userData = {
            player: await this.client.playerDb.load(id),
            activity: await this.client.activityDb.load(id),
            inventory: await this.client.inventoryDb.load(id),
            squad: await this.client.squadDb.loadUser(id),
            map: await this.client.mapDb.load(id),
            quest: await this.client.questDb.load(id),
            additional: await this.client.additionalDb.load(id),
        };

        for (let i = 0; i < objectives.length; i++) {
            const o = objectives[i];
            let completedInDepth = false;

            switch (o.type) {
                case "reachStatisticLevel":
                    const statistic = o.additionalData.statistic;
                    const userStatistic = userData.player.statistics[statistic];

                    if (userStatistic.level >= o.additionalData.levelToReach) completedInDepth = true;
                    break;
                case "reachDestination":
                    const { region, area } = o.additionalData;
                    const userRegion = userData.map.region;
                    const userArea = userData.map.region;

                    if (userRegion.id === region && userArea.id === area) completedInDepth = true;
                    break;
                case "haveMoney":
                    const userMoney = userData.inventory.wallet;

                    if (userMoney >= o.additionalData.amountToReach) completedInDepth = true;
                    break;
                case "haveExperience":
                    const userExperience = userData.player.level;

                    if (userExperience.exp >= o.additionalData.amountToReach) completedInDepth = true;
                    break;
                case "haveKasugaiCrowExperience":
                    const userKasugaiCrowExperience = userData.inventory.kasugaiCrow.exp;

                    if (userKasugaiCrowExperience >= o.additionalData.amountToReach) completedInDepth = true;
                    break;
                case "haveKasugaiCrow":
                    if ("kasugaiCrow" in o.additionalData) {
                        completedInDepth = userData.inventory.kasugaiCrow.id === o.additionalData.kasugaiCrow;
                    }
                    else {
                        completedInDepth = userData.inventory.kasugaiCrow.id !== null;
                    }
                    break;
                case "beWithoutKasugaiCrow":
                    completedInDepth = userData.inventory.kasugaiCrow.id === null;
                    break;
                case "haveEquippedEnchantedGrimoire":
                    if ("enchantedGrimoire" in o.additionalData) {
                        completedInDepth = userData.inventory.equippedGrimoire.id === o.additionalData.enchantedGrimoire;
                    }
                    else {
                        completedInDepth = userData.inventory.equippedGrimoire.id !== null;
                    }
                    break;
                case "haveEquippedWeapon":
                    if ("weapon" in o.additionalData) {
                        completedInDepth = userData.inventory.equippedWeapon.id === o.additionalData.weapon;
                    }
                    else {
                        completedInDepth = userData.inventory.equippedWeapon.id !== null;
                    }
                    break;
                case "beUnarmed":
                    completedInDepth = userData.inventory.weapon.id === null;
                    break;
                case "haveABeingForgedWeapon":
                    if ("weapon" in o.additionalData) {
                        completedInDepth = userData.activity.forgingSlots.map(s => s.weapon.id).includes(o.additionalData.weapon);
                    }
                    else {
                        completedInDepth = userData.activity.forgingSlots.length > 0;
                    }
                    break;
                case "haveWeapon":
                    if ("weapon" in o.additionalData) {
                        completedInDepth = userData.inventory.items.weapons.map(w => w.id).includes(o.additionalData.weapon);
                    }
                    else {
                        completedInDepth = userData.inventory.items.weapons.length > 0;
                    }
                    break;
                case "haveMaterials":
                    const amountToReach = o.additionalData.amountToReach;
                    completedInDepth = o.additionalData.material in userData.inventory.items.materials
                        ? (userData.inventory.items.materials[o.additionalData.material] >= amountToReach)
                        : false;
                    break;
                case "haveMasteredBreathingStyle":
                    if ("breathingStyle" in o.additionalData) {
                        const breathingStyle = o.additionalData.breathingStyle;

                        completedInDepth = userData.player.breathingStyle === breathingStyle;
                    }
                    else {
                        completedInDepth = userData.player.breathingStyle !== null;
                    }
                    break;
                case "beSquadMember":
                    if ("squad" in o.additionalData) {
                        const squad = o.additionalData.squad;

                        completedInDepth = userData.squad !== null
                            ? (userData.squad.id === squad) : false;
                    }
                    else {
                        completedInDepth = userData.squad !== null;
                    }
                    break;
                case "haveFoundSquad":
                    const squadsFound = await this.client.squadDb.foundByUser(id);
                    let squadsIncluded = true;
                    let squadsAmountReached = true;
                    if ("squads" in o.additionalData) {
                        for (const squad in o.additionalData.squads) {
                            if (squadsIncluded && !squadsFound.includes(squad)) squadsIncluded = false;
                        }

                        completedInDepth = squadsIncluded && squadsAmountReached;
                    }
                    if ("amount" in o.additionalData) {
                        squadsAmountReached = squadsFound.length >= o.additionalData.amount;
                    }
                    else {
                        squadsAmountReached = squadsFound.length > 0;
                    }
                    completedInDepth = squadsIncluded && squadsAmountReached;
                    break;
                case "leadSquad":
                    if ("squad" in o.additionalData) {
                        const squad = o.additionalData.squad;

                        completedInDepth = userData.squad !== null
                            ? (userData.squad.id === squad && userData.squad.details.owner.id === id) : false;
                    }
                    else {
                        completedInDepth = userData.squad !== null ? (userData.squad.details.owner.id === id) : false;
                    }
                    break;
                case "haveProgressedTutorial":
                    const tutorialStep = o.additionalData.step in userData.additional.rpg.tutorialProgress;
                    let tutorialAmount = true;
                    if (tutorialStep) {
                        const userProgress = userData.additional.rpg.tutorialProgress[o.additionalData.step];
                        if ("amount" in o.additionalData) {
                            tutorialAmount = userProgress >= o.additionalData.amount;
                        }
                    }
                    completedInDepth = tutorialStep && tutorialAmount;
                    break;
                case "ranCommand":
                    const commandId = o.additionalData.command in userData.additional.rpg.commandsAmount;
                    let commandAmount = true;
                    if (commandId) {
                        const userProgress = userData.additional.rpg.commandsAmount[o.additionalData.command];
                        if ("amount" in o.additionalData) {
                            commandAmount = userProgress >= o.additionalData.amount;
                        }
                    }
                    completedInDepth = commandId && commandAmount;
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

    /**
     * Drop the rewards of specified objectives. Set rewards as collected directly in the database.
     * @param {String} id The user ID
     * @param {String} objectiveIds The list of ids of the objectives to drop rewards for
     * @param {String} objectives The list of objectives
     * @param {String} rewards The list of rewards
     * @returns {Promise<void>}
     */
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

    /**
     * Verify if the slayer quest is completed.
     * @param {string} id The user ID
     * @returns {Promise<String[]>} The list of completed objectives ids
     */
    async refreshSlayerQuestObjectives(id) {
        const userQuestData = await this.load(id);
        if (userQuestData.schemaInstance) return null;

        const slayerQuest = userQuestData.currentQuests.slayerQuest[0];
        if (slayerQuest === null) return null;

        const objectives = slayerQuest.objectives;
        return await this.refreshQuestObjectives(id, objectives);
    }

    /**
     * Verify if the slayer quest is completed and get the slayer quest rewards.
     * @param {String} id The user ID
     * @param {String[]} objectiveIds The list of ids of the objectives to drop rewards for
     * @returns {Promise<void>}
     */
    async getSlayerQuestRewards(id, objectiveIds) {
        const userQuestData = await this.load(id);
        if (userQuestData.schemaInstance) return;

        const slayerQuest = userQuestData.currentQuests.slayerQuest[0];
        if (slayerQuest === null) return;

        const [objectives, rewards] = [slayerQuest.objectives, slayerQuest.rewards];
        await this.getQuestRewards(id, objectiveIds, objectives, rewards);
    }

    /**
     * Verify if the slayer quest is completed and get the slayer quest rewards. Concat all functions into one:
     * WE NEED TO CALL THIS IN THE LISTENER.
     * @param {String} id The user ID
     * @returns {Promise<void>}
     */
    async updateSlayerQuest(id) {
        const refreshSlayerQuestObjectives = await this.refreshSlayerQuestObjectives(id);
        if (refreshSlayerQuestObjectives.length > 0) {
            await this.getSlayerQuestRewards(id, refreshSlayerQuestObjectives);
        }
    }
}

module.exports = QuestDb;