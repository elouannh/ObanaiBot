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
                const quest = this.data[collection][questType];
                if (!quest?.id) continue;

                this.data[collection][questType] = this.client.RPGAssetsManager.loadQuest(this.lang, quest.id, quest);
            }
        }
    }
}

module.exports = QuestData;