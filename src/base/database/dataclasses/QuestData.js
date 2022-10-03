const TableData = require("../../TableData");

class QuestData extends TableData {
    constructor(client, questData, lang) {
        super(client, questData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        for (const collection of ["currentQuests", "completedQuests"]) {
            for (const questType in this.data[collection]) {
                const questsInType = this.data[collection][questType];
                const questsTypeArray = [];
                for (const questId in questsInType) {
                    const quest = questsInType[questId];
                    questsTypeArray.push(this.client.RPGAssetsManager.getQuest(this.lang, quest.id, quest));
                }
                this.data[collection][questType] = questsTypeArray;
            }
            this.data[collection].dailyAmount = this.data[collection].dailyQuests.length;
            this.data[collection].sideAmount = this.data[collection].sideQuests.length;
            this.data[collection].slayerAmount = this.data[collection].slayerQuest.length;
        }
    }
}

module.exports = QuestData;