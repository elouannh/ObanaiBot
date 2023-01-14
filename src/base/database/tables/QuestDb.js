/* eslint-disable no-case-declarations */
const SQLiteTable = require("../../SQLiteTable");
const QuestData = require("../dataclasses/QuestData");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
// eslint-disable-next-line no-unused-vars
const Command = require("../../Command");

function schema(id) {
    return {
        id: id,
        currentQuests: {
            dailyQuest: {},
            sideQuest: {},
            slayerQuest: {},
        },
        storyProgression: ["0", "0", "0", null],
        sideProgression: ["0", "0", "0", null],
        notifications: "dm",
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
     * @property {String} questId The quest ID
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
     * Get per objective type.
     * @param {String} id The user ID
     * @param {String} objectiveType The objective type
     * @returns {Object} The quest object that comes from the database
     */
    async getPerObjectiveType(id, objectiveType) {
        const quest = await this.load(id);
        const questsPerObjectiveType = {};

        for (const [key, value] of Object.entries(quest.currentQuests)) {
            if (!value?.id) continue;

            const includesObjective = value.objectives.filter((objective) => objective.type === objectiveType);
            const includedCompleted = includesObjective.some((objective) => objective.completed === false);
            if (!includedCompleted) continue;

            questsPerObjectiveType[key] = value;
        }

        return questsPerObjectiveType;
    }

    /**
     * Get PNJ of quest data object.
     * @param {String} id The user ID
     * @param {String} objectiveType The objective type
     * @returns {Promise<RPGCharacter[]>} The list of PNJ
     */
    async getPNJs(id, objectiveType) {
        const quest = await this.getPerObjectiveType(id, objectiveType);
        const localisation = await this.client.mapDb.load(id);
        const pnjs = [];
        for (const questInstance of Object.values(quest)) {
            for (const objective of questInstance.objectives) {
                const data = objective.additionalData;
                if (objective.type !== objectiveType || !data.characterId) continue;

                if (data.area === localisation.area.id && data.region === localisation.region.id) {
                    const pnj = this.client.RPGAssetsManager.getCharacter(
                        this.client.playerDb.getLang(id), data.characterId,
                    );
                    if (!(typeof pnj === "string")) pnjs.push(pnj);
                }
            }
        }
        return pnjs;
    }

    /**
     * @typedef {Object} DialogueData
     * @property {String} id The id of the dialogue
     * @property {String} name The name of the dialogue (translated)
     * @property {String[]} content The dialogue replicas (translated)
     */
    /**
     * Get all the dialogs associated with the pnj id.
     * @param {String} id The user ID
     * @param {String} pnjId The pnj ID
     * @returns {Promise<{dialogue: DialogueData, objectiveId: String, questKey: String}[]>} The list of dialogues
     */
    async getDialoguesByPNJ(id, pnjId) {
        const quest = (await this.load(id)).currentQuests;
        const dialogues = [];
        for (const [questKey, questInstance] of Object.entries(quest)) {
            if (!questInstance?.id) continue;

            for (const objective of questInstance.objectives) {
                const data = objective.additionalData;
                if (!data.characterId) continue;

                if (data.characterId !== pnjId) continue;

                const dialogue = await this.client.RPGAssetsManager.getDialogue(
                    this.client.playerDb.getLang(id), data.dialogueId,
                );

                if (dialogue.content.length) dialogues.push({ dialogue, objectiveId: objective.id, questKey });
            }
        }
        return dialogues;
    }

    /**
     * Display a dialogue as a menu.
     * @param {Command} command The command context
     * @param {DialogueData} dialogue, The dialogue string array
     * @returns {Promise<void>}
     */
    async displayDialogue(command, dialogue) {
        let method = "reply";
        if (command.interaction.replied) method = "editReply";

        let pageId = 1;
        let loop = true;

        const menu = await command.interaction[method]({
            content: dialogue.content.slice(0, pageId).join("\n"),
            components: [
                 new ActionRowBuilder().setComponents(
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setEmoji(this.client.enums.Systems.Symbols.Next)
                        .setStyle(ButtonStyle.Primary),
                ),
            ],
        }).catch(this.client.catchError);

        while (loop) {
            const inter = await menu.awaitMessageComponent({
                filter: interaction => interaction.user.id === command.interaction.user.id,
                time: 60_000,
            });
            await inter.deferUpdate().catch(this.client.catchError);

            if (inter.customId === "next") pageId++;

            await command.interaction.editReply({
                content: dialogue.content.slice(0, pageId).join("\n"),
                components: [
                    new ActionRowBuilder().setComponents(
                        new ButtonBuilder()
                            .setCustomId(dialogue.content.length > pageId ? "next" : "end")
                            .setEmoji(
                                dialogue.content.length > pageId ?
                                    this.client.enums.Systems.Symbols.Next
                                    : this.client.enums.Systems.Symbols.Check,
                            )
                            .setStyle(dialogue.content.length > pageId ? ButtonStyle.Primary : ButtonStyle.Success),
                    ),
                ],
            }).catch(this.client.catchError);

            if (inter.customId === "end") {
                await command.interaction.editReply({
                    content: dialogue.content.join("\n"),
                    components: [],
                }).catch(this.client.catchError);

                loop = false;
            }
        }

        await command.interaction.editReply({ components: [] }).catch(this.client.catchError);
        return command.end();
    }

    /**
     * Sets the current daily quest for the user.
     * @param {String} id The user ID
     * @param {String} questId The quest ID to set
     * @return {void}
     */
    setDailyQuest(id, questId) {
        const dailyQuestId = `${questId}`;
        const dailyQuest = this.client.RPGAssetsManager.getQuest(this.client.playerDb.getLang(id), dailyQuestId);

        this.set(
            id,
            dailyQuest,
            "currentQuests.dailyQuest",
        );
    }

    /**
     * Sets the current slayer (main) quest for the user. The branch designs where the quest is located, keep "main" to avoid problems.
     * @param {String} id The user ID
     * @param {String} volume The tome ID
     * @param {String} arc The arc ID
     * @param {String} chapter The quest ID to set
     * @param {String} step The step of the quest
     * @return {void}
     */
    setSlayerQuest(id, volume, arc, chapter, step) {
        const slayerQuestId = `slayer.${volume}.${arc}.${chapter}.${step}`;
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
            "currentQuests.slayerQuest",
        );
    }

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
                    const userArea = data.area;

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
                    void this.client.playerDb.addExp(id, reward.data.amount);
                    break;
                case "material":
                    void this.client.inventoryDb.addMaterial(id, reward.data.material, reward.data.amount);
                    break;
                case "questItem":
                    void this.client.inventoryDb.addQuestItem(id, reward.data.questItem, reward.data.amount);
                    break;
                case "money":
                    void this.client.inventoryDb.addMoney(id, reward.data.amount);
                    break;
                case "enchantedGrimoire":
                    void this.client.inventoryDb.addEnchantedGrimoire(
                        id, reward.data.enchantedGrimoire, reward.data.amount,
                    );
                    break;
                case "weapon":
                    void this.client.inventoryDb.addWeapon(
                        id, reward.data.weapon, reward.data.rarity, reward.data.amount,
                    );
                    break;
                case "theme":
                    void this.client.additionalDb.unlockTheme(id, reward.data.theme);
                    break;
                case "kasugaiCrowExp":
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
     * @param {QuestLocal} localQuest The local quest object (from the assets)
     * @param {String} tableFocused The table to focus on
     * @returns {Promise<Array>} The list of actions executed: objectiveCompleted, etc.
     */
    async isQuestCompleted(id, quest, localQuest, tableFocused) {
        const actionsLogged = [];
        const rewardsToAdd = [];
        for (const objectiveId in quest.objectives) {
            const userObjective = quest.objectives[objectiveId];

            const localObjective = localQuest.objectives[objectiveId];
            const localObjectiveRewards = localQuest.rewards[objectiveId];

            const completed = await this.isObjectiveCompleted(id, Object.assign(localObjective, { questId: quest.id }), tableFocused);
            const dbCompleted = this.get(id).currentQuests[`${quest.id.split(".")[0]}Quest`]
                .objectives[objectiveId].completed;
            const dbCollected = this.get(id).currentQuests[`${quest.id.split(".")[0]}Quest`]
                .objectives[objectiveId].rewardsCollected;

            if (completed || dbCompleted) {
                if (dbCompleted) {
                    if (userObjective.rewardsCollected || dbCollected) continue;

                    rewardsToAdd.push(localObjectiveRewards.data);
                    this.setObjectiveRewardCollected(id, quest.id.split(".")[0], objectiveId);
                    actionsLogged.push({ event: "objectiveCompleted", objectiveId });
                }
                else if (completed) {
                    if (userObjective.rewardsCollected || dbCollected) continue;

                    rewardsToAdd.push(localObjectiveRewards.data);
                    this.setObjectiveCompleted(id, quest.id.split(".")[0], objectiveId);
                    this.setObjectiveRewardCollected(id, quest.id.split(".")[0], objectiveId);
                    actionsLogged.push({ event: "objectiveCompleted", objectiveId });
                }
            }
            else {
                actionsLogged.push({ event: "objectiveNotCompleted", objectiveId });
            }
        }
        if (rewardsToAdd.length > 0) {
            for (const reward of rewardsToAdd) {
                await this.giveObjectiveRewards(id, reward);
            }
        }
        return actionsLogged;
    }

    /**
     * Mark a slayer quest objective as completed.
     * @param {String} id The user ID
     * @param {String} questCategory The quest type (daily/side/slayer)
     * @param {String} objectiveId The ID of the objective to set as completed
     * @returns {void}
     */
    setObjectiveCompleted(id, questCategory, objectiveId) {
        this.set(id, true, `currentQuests.${questCategory}Quest.objectives.${objectiveId}.completed`);
    }

    /**
     * Mark a slayer quest objective as rewards collected.
     * @param {String} id The user ID
     * @param {String} questCategory The quest type (daily/side/slayer)
     * @param {String} objectiveId The ID of the objective to set as completed
     * @returns {void}
     */
    setObjectiveRewardCollected(id, questCategory, objectiveId) {
        this.set(id, true, `currentQuests.${questCategory}Quest.objectives.${objectiveId}.rewardsCollected`);
    }

    /**
     * Function that allowss you to set manually an objective as completed.
     * @param {String} id The user ID
     * @param {String} questCategory The quest type (daily/side/slayer)
     * @param {String} objectiveId The ID of the objective to set as completed
     * @returns {void}
     */
    async setObjectiveManuallyCompleted(id, questCategory, objectiveId) {
        questCategory = questCategory.replace("Quest", "");
        const quest = this.get(id).currentQuests[`${questCategory}Quest`];

        const dbCompleted = this.get(id).currentQuests[`${quest.id.split(".")[0]}Quest`]
            .objectives[objectiveId].completed;

        if (!dbCompleted) this.setObjectiveCompleted(id, quest.id.split(".")[0], objectiveId);

        await this.questsCleanup(id, "none");
    }

    /**
     * @typedef {Object} VerifiedQuestActions
     * @property {Boolean} dailyFinished If the daily quest is finished
     * @property {Boolean} sideFinished If the side quest is finished
     * @property {Boolean} slayerFinished If the slayer quest is finished
     * @property {Object[]} dailyActions The list of actions executed for daily quest: objectiveCompleted, etc.
     * @property {Object[]} sideActions The list of actions executed for side quest: objectiveCompleted, etc.
     * @property {Object[]} slayerActions The list of actions executed for slayer quest: objectiveCompleted, etc.
     */
    /**
     * Function that will verify each quests one by one to see if they are completed
     * @param {String} id The user ID
     * @param {String} tableFocused The table to focus on
     * @returns {Promise<VerifiedQuestActions>}
     */
    async verifyAllQuests(id, tableFocused) {
        const quests = await this.get(id);

        const dailyQuest = quests.currentQuests.dailyQuest;
        const dailyActions = dailyQuest?.id === undefined ? [] : await this.isQuestCompleted(
            id,
            dailyQuest,
            this.client.RPGAssetsManager.quests.dailyQuests[dailyQuest.id],
            tableFocused,
        );

        const sideQuest = quests.currentQuests.sideQuest;
        const sideActions = sideQuest?.id === undefined ? [] : await this.isQuestCompleted(
            id,
            sideQuest,
            this.client.RPGAssetsManager.quests.sideQuests[sideQuest.id],
            tableFocused,
        );

        const slayerQuest = quests.currentQuests.slayerQuest;
        const slayerActions = slayerQuest?.id === undefined ? [] : await this.isQuestCompleted(
            id,
            slayerQuest,
            this.client.RPGAssetsManager.quests.slayerQuests[slayerQuest.id],
            tableFocused,
        );

        const dailyFinished = dailyActions.length > 0 && dailyActions.every((action) => action.event === "objectiveCompleted");
        const sideFinished = sideActions.length > 0 && sideActions.every((action) => action.event === "objectiveCompleted");
        const slayerFinished = slayerActions.length > 0 && slayerActions.every((action) => action.event === "objectiveCompleted");

        return { dailyFinished, sideFinished, slayerFinished, dailyActions, sideActions, slayerActions };
    }

    /**
     * Updates the slayer progression.
     * @param {String} id The user ID
     * @param {String} volume The volume of the story
     * @param {String} arc The arc of the story
     * @param {String} chapter The chapter of the story
     * @param {String|null} step The step of the story
     * @returns {void}
     */
    updateSlayerProgression(id, volume, arc, chapter, step) {
        this.set(id, [volume, arc, chapter, step], "storyProgression");
    }

    /**
     * Deletes the quest of the user in the database and replaces it with an empty objectif.
     * @param {String} id The user ID
     * @param {String} questType The quest type: daily, side or slayer
     * @returns {void}
     */
    deleteQuest(id, questType) {
        this.set(id, {}, `currentQuests.${questType}Quest`);
    }

    /**
     * Verify quests, notify and delete them if they are completed.
     * @param {String} id The user ID
     * @param {String} tableFocused The table to focus on
     * @returns {Promise<void>}
     */
    async questsCleanup(id, tableFocused) {
        const verified = await this.verifyAllQuests(id, tableFocused);
        await this.notifyQuests(id, verified);

        if (verified.dailyFinished) this.deleteQuest(id, "daily");
        if (verified.sideFinished) this.deleteQuest(id, "side");
        if (verified.slayerFinished) {
            const questId = this.get(id).currentQuests.slayerQuest.id;
            this.updateSlayerProgression(id, ...questId.split(".").slice(1));
            this.deleteQuest(id, "slayer");
        }
    }

    /**
     * Function that will notify if a quest is completed or not.
     * @param {String} id The user ID
     * @param {VerifiedQuestActions} verified The table to focus on
     * @returns {Promise<void>}
     */
    async notifyQuests(id, verified) {
        const lang = this.client.languageManager.getLang(this.client.playerDb.get(id)).json;
        const userQuests = await this.get(id);

        const embed = new EmbedBuilder()
            .setTitle(
                `${this.client.enums.Rpg.Concepts.Notifications} **${lang.rpgAssets.concepts.notificationsAlert}**`,
            )
            .setColor(this.client.enums.Colors.Green);
        let toSend = false;

        if (
            verified.slayerActions.length > 0 &&
            !verified.slayerActions.every((action) => action.event === "objectiveNotCompleted")
        ) {
            toSend = true;
            const quest = this.client.RPGAssetsManager.getQuest(lang.id, userQuests.currentQuests.slayerQuest.id);

            const doneObjectives = [];
            for (const obj of verified.slayerActions) {
                if (obj.event === "objectiveCompleted") {
                    doneObjectives.push(quest.objectives[Number(obj.objectiveId)]);
                }
            }

            const name = `${this.client.enums.Rpg.Concepts.SlayerQuest} `
                + `- ${lang.rpgAssets.embeds.slayerQuestObjectivesCompleted}`;
            let value = `\u200b\n**${quest.name}**`
                + `\n__${lang.rpgAssets.embeds.objectives} :__\n${doneObjectives
                    .map(e => `> **\`-\`** ${e.name}\n${
                        quest.rewards[Number(e.id)].items
                            .map(f => `${"\u200b ".repeat(5)}*➥ ${f[0]}*`)
                            .join("\n")
                    }`)
                    .join("\n")
                }`;
            if (verified.slayerFinished) {
                value += `\`\`\`fix\n${lang.rpgAssets.embeds.questNowCompleted} !\`\`\`\n`
                    + `> __${lang.rpgAssets.embeds.totalEarned}:__\n${quest.rewards
                        .map(e => `${"\u200b ".repeat(5)}*➥ ${e.items.map(f => `${f[0]}`).join(", ")}*`)
                        .join("\n")
                    }`;
            }

            embed.addFields({ name: `${name}`, value, inline: false });
        }

        if (
            verified.sideActions.length > 0 &&
            !verified.sideActions.every((action) => action.event === "objectiveNotCompleted")
        ) {
            if (toSend) embed.addFields({ name: "\u200b", value: "\u200b", inline: false });
            toSend = true;
            const quest = this.client.RPGAssetsManager.getQuest(lang.id, userQuests.currentQuests.sideQuest.id);

            const doneObjectives = [];
            for (const obj of verified.sideActions) {
                if (obj.event === "objectiveCompleted") {
                    doneObjectives.push(quest.objectives[Number(obj.objectiveId)]);
                }
            }

            const name = `${this.client.enums.Rpg.Concepts.SideQuest} `
                + `- ${lang.rpgAssets.embeds.sideQuestObjectivesCompleted}`;
            let value = `\u200b\n**${quest.name}**`
                + `\n${lang.rpgAssets.embeds.objectives} :__\n${doneObjectives
                    .map(e => `> **\`-\`** ${e.name}\n${
                        quest.rewards[Number(e.id)].items
                            .map(f => `${"\u200b ".repeat(5)}*➥ ${f[0]}*`)
                            .join("\n")
                    }`)
                    .join("\n")
                }`;
            if (verified.sideFinished) {
                value += `\`\`\`fix\n${lang.rpgAssets.embeds.questNowCompleted} !\`\`\`\n`
                    + `> __${lang.rpgAssets.embeds.totalEarned}:__\n${quest.rewards
                        .map(e => `${"\u200b ".repeat(5)}*➥ ${e.items.map(f => `${f[0]}`).join(", ")}*`)
                        .join("\n")
                    }`;
            }

            embed.addFields({ name: `${name}`, value, inline: false });
        }

        if (
            verified.dailyActions.length > 0 &&
            !verified.dailyActions.every((action) => action.event === "objectiveNotCompleted")
        ) {
            if (toSend) embed.addFields({ name: "\u200b", value: "\u200b", inline: false });
            toSend = true;
            const quest = this.client.RPGAssetsManager.getQuest(lang.id, userQuests.currentQuests.dailyQuest.id);

            const doneObjectives = [];
            for (const obj of verified.dailyActions) {
                if (obj.event === "objectiveCompleted") {
                    doneObjectives.push(quest.objectives[Number(obj.objectiveId)]);
                }
            }

            const name = `${this.client.enums.Rpg.Concepts.DailyQuest} `
                + `- ${lang.rpgAssets.embeds.dailyQuestObjectivesCompleted}`;
            let value = `\u200b\n**${quest.name}**`
                + `\n${lang.rpgAssets.embeds.objectives} :__\n${doneObjectives
                    .map(e => `> **\`-\`** ${e.name}\n${
                        quest.rewards[Number(e.id)].items
                            .map(f => `${"\u200b ".repeat(5)}*➥ ${f[0]}*`)
                            .join("\n")
                    }`)
                    .join("\n")
                }`;
            if (verified.dailyActions) {
                value += `\`\`\`fix\n${lang.rpgAssets.embeds.questNowCompleted} !\`\`\`\n`
                    + `> __${lang.rpgAssets.embeds.totalEarned}:__\n${quest.rewards
                        .map(e => `${"\u200b ".repeat(5)}*➥ ${e.items.map(f => `${f[0]}`).join(", ")}*`)
                        .join("\n")
                    }`;
            }

            embed.addFields({ name: `${name}`, value, inline: false });
        }

        if (toSend) {
            let channel = null;
            if (userQuests.notifications === "dm") {
                channel = await this.client.getUser(id, { id: null });
            }
            else if (userQuests.notifications === "last") {
                channel = await this.client.getChannel(
                    this.client.lastChannelsManager.getSub(id, "main")?.id || "0", { id: null },
                );
            }

            if (channel !== null && channel.id !== null) await this.client.notify(channel, { embeds: [embed] });
        }
    }

    /**
     * Function that will return the index of the current user slayer quest into the all quests lists, and also the next.
     * @param {String} id The user ID
     * @returns {{index: Number, last: String, next: String}}
     */
    getSlayerProgress(id) {
        const list = this.client.RPGAssetsManager.getSlayerQuestsIds();
        const userQuest = this.get(id).storyProgression;

        const index = list.indexOf(`slayer.${userQuest[0]}.${userQuest[1]}.${userQuest[2]}.${userQuest[3]}`);
        const last = list[index];
        const next = list[index + 1] || "none";

        return { index, last, next };
    }

    /**
     * Function that skip the current user slayer quest.
     * @param {String} id The user ID
     * @returns {Promise<void>}
     */
    async skipSlayerQuest(id) {
        const quest = this.get(id).currentQuests.slayerQuest;
        for (const obj in quest.objectives) {
            this.setObjectiveCompleted(id, "slayerQuest", obj);
        }
       for (const db of ["playerDb", "inventoryDb", "mapDb", "additionalDb", "activityDb", "squadDb"]) {
            void await this.questsCleanup(id, db);
        }
    }

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
                `⟪ ${this.client.enums.Rpg.Concepts.SlayerQuest} ⟫ `
                + lang.rpgAssets.concepts.slayerQuest + ` - \`${user.tag}\``,
            )
            .setColor(this.client.enums.Colors.Blurple);

        if (data.currentQuests.slayerQuest.id) {
            slayerEmbed.addFields(
                {
                    name: lang.rpgAssets.embeds.questName,
                    value: data.currentQuests.slayerQuest.name,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.embeds.questLabel,
                    value: data.currentQuests.slayerQuest.label,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: `> *${data.currentQuests.slayerQuest.description}*\n`
                        + `[**${data.currentQuests.slayerQuest.wattpad.alt}**]`
                        + `(${data.currentQuests.slayerQuest.wattpad.link})`,
                    inline: false,
                },
                {
                    name: lang.rpgAssets.embeds.objectives,
                    value: data.currentQuests.slayerQuest.objectives
                        .map((e, i) => `\`[${e.progress}] ${i + 1}.\` *`
                            + `${e.completed ? "~~" : "*"}${e.name}${e.completed ? "~~" : "*"}*\n${
                            data.currentQuests.slayerQuest.rewards[i].items
                                .map((f) => `${"\u200b ".repeat(5)}`
                                    + `${e.completed ? "~~" : ""}*➥ ${f[0]}*${e.completed ? "~~" : ""}`,
                                )
                                .join("\n")
                        }`)
                        .join("\n\n"),
                    inline: false,
                },
            );
        }
        else {
            slayerEmbed.setDescription(lang.rpgAssets.embeds.noQuest);
        }

        const sideEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Concepts.SideQuest} ⟫ `
                + lang.rpgAssets.concepts.sideQuest + ` - \`${user.tag}\``,
            )
            .setColor(this.client.enums.Colors.Blurple);

        if (data.currentQuests.sideQuest.id) {
            sideEmbed.addFields(
                {
                    name: lang.rpgAssets.embeds.questName,
                    value: data.currentQuests.sideQuest.name,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.embeds.questLabel,
                    value: data.currentQuests.sideQuest.label,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: `> *${data.currentQuests.sideQuest.description}*`,
                    inline: false,
                },
                {
                    name: lang.rpgAssets.embeds.objectives,
                    value: data.currentQuests.sideQuest.objectives
                        .map((e, i) => `\`[${e.progress}] ${i + 1}.\` *`
                            + `${e.completed ? "~~" : "*"}${e.name}${e.completed ? "~~" : "*"}*\n${
                                data.currentQuests.sideQuest.rewards[i].items
                                    .map((f) => `${"\u200b ".repeat(5)}`
                                        + `${e.completed ? "~~" : ""}*➥ ${f[0]}*${e.completed ? "~~" : ""}`,
                                    )
                                    .join("\n")
                            }`)
                        .join("\n\n"),
                    inline: false,
                },
            );
        }
        else {
            sideEmbed.setDescription(lang.rpgAssets.embeds.noQuest);
        }

        const dailyEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Concepts.DailyQuest} ⟫ `
                + lang.rpgAssets.concepts.dailyQuest + ` - \`${user.tag}\``,
            )
            .setColor(this.client.enums.Colors.Blurple);

        if (data.currentQuests.dailyQuest.id) {
            dailyEmbed.addFields(
                {
                    name: lang.rpgAssets.embeds.questName,
                    value: data.currentQuests.dailyQuest.name,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.embeds.questLabel,
                    value: data.currentQuests.dailyQuest.label,
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: `> *${data.currentQuests.dailyQuest.description}*`,
                    inline: false,
                },
                {
                    name: lang.rpgAssets.embeds.objectives,
                    value: data.currentQuests.dailyQuest.objectives
                        .map((e, i) => `\`[${e.progress}] ${i + 1}.\` *`
                            + `${e.completed ? "~~" : "*"}${e.name}${e.completed ? "~~" : "*"}*\n${
                                data.currentQuests.dailyQuest.rewards[i].items
                                    .map((f) => `${"\u200b ".repeat(5)}`
                                        + `${e.completed ? "~~" : ""}*➥ ${f[0]}*${e.completed ? "~~" : ""}`,
                                    )
                                    .join("\n")
                            }`)
                        .join("\n\n"),
                    inline: false,
                },
            );
        }
        else if (Number(this.client.playerDb.get(user.id).rank) >= 1) {
            dailyEmbed.setDescription(lang.rpgAssets.embeds.noQuest);
        }
        else {
            dailyEmbed.setDescription(`🔒 ${lang.rpgAssets.embeds.dailyLocked}`);
        }

        return [slayerEmbed, sideEmbed, dailyEmbed];
    }
}

module.exports = QuestDb;