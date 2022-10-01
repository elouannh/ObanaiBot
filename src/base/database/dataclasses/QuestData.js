const TableData = require("../../TableData");

class QuestData extends TableData {
    constructor(client, questData, lang) {
        super(client, questData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        for (const questType in this.data.currentQuests) {
            const questsInType = this.data.currentQuests[questType];
            const questsTypeArray = [];
            for (const questId in questsInType) {
                const quest = questsInType[questId];
                questsTypeArray.push(this.client.RPGAssetsManager.getQuest(this.lang, quest.id, quest));
            }
            this.data.currentQuests[questType] = questsTypeArray;
        }
        this.data.currentQuests.dailyAmount = this.data.currentQuests.dailyQuests.length;
        this.data.currentQuests.sideAmount = this.data.currentQuests.sideQuests.length;
        this.data.currentQuests.slayerAmount = this.data.currentQuests.slayerQuest.length;

        for (const questType in this.data.completedQuests) {
            const questsInType = this.data.completedQuests[questType];
            const questsTypeArray = [];
            for (const questId in questsInType) {
                const quest = questsInType[questId];
                questsTypeArray.push(this.client.RPGAssetsManager.getQuest(this.lang, quest.id, quest));
            }
            this.data.completedQuests[questType] = questsTypeArray;
        }
        this.data.completedQuests.dailyAmount = this.data.completedQuests.dailyQuests.length;
        this.data.completedQuests.sideAmount = this.data.completedQuests.sideQuests.length;
        this.data.completedQuests.slayerAmount = this.data.completedQuests.slayerQuest.length;

    }
}

module.exports = QuestData;