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
            const quest = this.data.currentQuests[questType];
            if (!quest?.id) continue;

            this.data.currentQuests[questType] = this.client.RPGAssetsManager.loadQuest(this.lang, quest.id, quest);
        }
    }
}

module.exports = QuestData;