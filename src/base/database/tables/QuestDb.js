/* eslint-disable no-case-declarations */
const SQLiteTable = require("../../SQLiteTable");
const QuestData = require("../dataclasses/QuestData");
const { EmbedBuilder } = require("discord.js");

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
        storyProgression: [0, 0, null],
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
            };
        }

        this.set(
            id,
            questObject,
            `currentQuests.slayerQuest.${branch}`,
        );
    }

    /**
     * @typedef {Object} QuestObjectiveObject
     * @property {Boolean} completed The objective is completed or not
     * @property {Boolean} rewardsCollected The rewards are collected or not
     */
    /**
     * @typedef {Object} QuestObject
     * @property {String} id The quest ID
     * @property {Object} objectives The list of objectives
     */
    /**
     * @typedef {Object} QuestObjectiveLocal
     * @property {String} id The objective ID
     * @property {String} type The objective type
     * @property {Object} additionalData Additional data for the objective
     */
    /**
     * @typedef {Object} QuestLocal
     * @property {String} id The quest ID
     * @property {Object} objectives The list of objectives
     * @property {Object} rewards The list of rewards
     */
    /**
     * Verify if an objective is completed. Simply returns true or false. Please specify in which table you want to look
     * to avoid infinite <changed> recalls.
     * @param {String} id The user ID
     * @param {QuestObjectiveLocal} localObjective The local objective to verify (synced with the database)
     * @param {String} tableFocused The SQLite table focused
     * @returns {Promise<Boolean>}
     */
    async isObjectiveCompleted(id, localObjective, tableFocused) {
        let completedInDepth = false;

        if (tableFocused === "activityDb") {
            const data = await this.client.activityDb.load(id);
            switch (localObjective.type) {
                case "haveABeingForgedWeapon":
                    if ("weapon" in localObjective.additionalData) {
                        completedInDepth = data.forgingSlots.map(s => s.weapon.id).includes(localObjective.additionalData.weapon);
                    }
                    else {
                        completedInDepth = data.forgingSlots.length > 0;
                    }
                    break;
                default:
                    break;
            }
        }
        else if (tableFocused === "additionalDb") {
            const data = await this.client.additionalDb.load(id);
            switch (localObjective.type) {
                case "haveProgressedTutorial":
                    const tutorialId = localObjective.additionalData.tutorial in data.rpg.tutorialProgress;
                    let tutorialProgress = false;
                    if (tutorialId) {
                        if (localObjective.additionalData.step in tutorialId) {
                            tutorialProgress = data.rpg.tutorialProgress[tutorialId] === true;
                        }
                    }
                    completedInDepth = tutorialId && tutorialProgress;
                    break;
                case "ranCommand":
                    const commandId = localObjective.additionalData.command in data.rpg.commandsAmount;
                    let commandAmount = true;
                    if (commandId) {
                        const userProgress = data.rpg.commandsAmount[localObjective.additionalData.command];
                        if ("amount" in localObjective.additionalData) {
                            commandAmount = userProgress >= localObjective.additionalData.amount;
                        }
                    }
                    completedInDepth = commandId && commandAmount;
                    break;
                default:
                    break;
            }
        }
        else if (tableFocused === "inventoryDb") {
            const data = await this.client.inventoryDb.load(id);
            switch (localObjective.type) {
                case "haveMoney":
                    const userMoney = data.wallet;

                    if (userMoney >= localObjective.additionalData.amountToReach) completedInDepth = true;
                    break;
                case "haveKasugaiCrowExperience":
                    const userKasugaiCrowExperience = data.kasugaiCrow.exp;

                    if (userKasugaiCrowExperience >= localObjective.additionalData.amountToReach) completedInDepth = true;
                    break;
                case "haveKasugaiCrow":
                    if ("kasugaiCrow" in localObjective.additionalData) {
                        completedInDepth = data.kasugaiCrow.id === localObjective.additionalData.kasugaiCrow;
                    }
                    else {
                        completedInDepth = data.kasugaiCrow.id !== null;
                    }
                    break;
                case "beWithoutKasugaiCrow":
                    completedInDepth = data.kasugaiCrow.id === null;
                    break;
                case "haveEquippedEnchantedGrimoire":
                    if ("enchantedGrimoire" in localObjective.additionalData) {
                        completedInDepth = data.equippedGrimoire.id === localObjective.additionalData.enchantedGrimoire;
                    }
                    else {
                        completedInDepth = data.equippedGrimoire.id !== null;
                    }
                    break;
                case "haveEquippedWeapon":
                    if ("weapon" in localObjective.additionalData) {
                        completedInDepth = data.equippedWeapon.id === localObjective.additionalData.weapon;
                    }
                    else {
                        completedInDepth = data.equippedWeapon.id !== null;
                    }
                    break;
                case "beUnarmed":
                    completedInDepth = data.weapon.id === null;
                    break;
                case "haveWeapon":
                    if ("weapon" in localObjective.additionalData) {
                        completedInDepth = data.items.weapons.map(w => w.id).includes(localObjective.additionalData.weapon);
                    }
                    else {
                        completedInDepth = data.items.weapons.length > 0;
                    }
                    break;
                case "haveMaterials":
                    const amountToReach = localObjective.additionalData.amountToReach;
                    completedInDepth = localObjective.additionalData.material in data.items.materials
                        ? (data.items.materials[localObjective.additionalData.material] >= amountToReach)
                        : false;
                    break;
                default:
                    break;
            }
        }
        else if (tableFocused === "mapDb") {
            const data = await this.client.mapDb.load(id);
            switch (localObjective.type) {
                case "reachDestination":
                    const { region, area } = localObjective.additionalData;
                    const userRegion = data.region;
                    const userArea = data.region;

                    if (userRegion.id === region && userArea.id === area) completedInDepth = true;
                    break;
                default:
                    break;
            }
        }
        else if (tableFocused === "playerDb") {
            const data = await this.client.playerDb.load(id);
            switch (localObjective.type) {
                case "reachStatisticLevel":
                    const statistic = localObjective.additionalData.statistic;
                    const userStatistic = data.statistics[statistic];

                    if (userStatistic.level >= localObjective.additionalData.levelToReach) completedInDepth = true;
                    break;
                case "haveExperience":
                    const userExperience = data.level;

                    if (userExperience.exp >= localObjective.additionalData.amountToReach) completedInDepth = true;
                    break;
                case "haveMasteredBreathingStyle":
                    if ("breathingStyle" in localObjective.additionalData) {
                        const breathingStyle = localObjective.additionalData.breathingStyle;

                        completedInDepth = data.breathingStyle === breathingStyle;
                    }
                    else {
                        completedInDepth = data.breathingStyle !== null;
                    }
                    break;
                default:
                    break;
            }
        }
        else if (tableFocused === "squadDb") {
            const data = await this.client.squadDb.load(id);
            switch (localObjective.type) {
                case "beSquadMember":
                    if ("squad" in localObjective.additionalData) {
                        const squad = localObjective.additionalData.squad;

                        completedInDepth = data !== null
                            ? (data.id === squad) : false;
                    }
                    else {
                        completedInDepth = data !== null;
                    }
                    break;
                case "haveFoundSquad":
                    const squadsFound = await this.client.squadDb.foundByUser(id);
                    let squadsIncluded = true;
                    let squadsAmountReached = true;
                    if ("squads" in localObjective.additionalData) {
                        for (const squad in localObjective.additionalData.squads) {
                            if (squadsIncluded && !squadsFound.includes(squad)) squadsIncluded = false;
                        }

                        completedInDepth = squadsIncluded && squadsAmountReached;
                    }
                    if ("amount" in localObjective.additionalData) {
                        squadsAmountReached = squadsFound.length >= localObjective.additionalData.amount;
                    }
                    else {
                        squadsAmountReached = squadsFound.length > 0;
                    }
                    completedInDepth = squadsIncluded && squadsAmountReached;
                    break;
                case "leadSquad":
                    if ("squad" in localObjective.additionalData) {
                        const squad = localObjective.additionalData.squad;

                        completedInDepth = data !== null
                            ? (data.id === squad && data.details.owner.id === id) : false;
                    }
                    else {
                        completedInDepth = data !== null ? (data.details.owner.id === id) : false;
                    }
                    break;
                default:
                    break;
            }
        }

        return completedInDepth;
    }

    /**
     * Give the reward to the user.
     * @param {String} id The user ID
     * @param {Object} objectiveRewards The objective to check
     * @returns {Promise<void>}
     */
    async giveObjectiveRewards(id, objectiveRewards) {
        for (const [key, reward = objectiveRewards[key]] in objectiveRewards) {
            switch (reward.type) {
                case "exp":
                    void this.client.playerDb.addExp(id, reward.amount);
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * Loop through all the objectives of a quest and check if they are completed, one by one. Return a boolean that
     * indicates if the quest is completed or not. For each objective completed, it writes it in the database.
     * @param {String} id The user ID
     * @param {QuestObject} quest The quest object (from the questDb)
     * @param {QuestLocal} localQuest The local quest object (from the assets
     * @param {String} tableFocused The table to focus on
     * @returns {Promise<*>} À déterminer parce que jsp dans quel contexte ça va me servir
     */
    async isQuestCompleted(id, quest, localQuest, tableFocused) {
        for (const objectiveId in quest.objectives) {
            const localObjective = localQuest.objectives[objectiveId];
            const localObjectiveRewards = localQuest.rewards[objectiveId];

            const completed = await this.isObjectiveCompleted(id, localObjective, tableFocused);
            if (completed) {
                await this.giveObjectiveRewards(id, localObjectiveRewards.data);
            }
        }
    }

        // ----------------------------------------------------------- //
      // PENSEZ À FAIRE CHERCHER "updateSlayerQuest" POUR REMOVE !!! //
    // ----------------------------------------------------------- //

    /**
     * Get the embed of the player profile.
     * @param {Object} lang The language object
     * @param {QuestData} data The quest data
     * @param {User} user The user
     * @returns {Promise<EmbedBuilder[]>}
     */
    async getEmbeds(lang, data, user) {
        const slayerEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Concepts.SlayerQuests} ⟫ `
                + lang.rpgAssets.concepts.slayerQuests + ` - \`${user.tag}\``,
            )
            .setColor(this.client.enums.Colors.Blurple);

        const sideEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Concepts.SideQuests} ⟫ `
                + lang.rpgAssets.concepts.sideQuests + ` - \`${user.tag}\``,
            )
            .setColor(this.client.enums.Colors.Blurple);

        const dailyEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Concepts.DailyQuests} ⟫ `
                + lang.rpgAssets.concepts.dailyQuests + ` - \`${user.tag}\``,
            )
            .setColor(this.client.enums.Colors.Blurple);

        return [slayerEmbed, sideEmbed, dailyEmbed];
    }
}

module.exports = QuestDb;