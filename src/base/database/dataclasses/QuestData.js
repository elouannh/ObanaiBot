const TableData = require("../../TableData");

class QuestData extends TableData {
    constructor(client, questData, lang) {
        super(client, questData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        for (const questsType in this.data.currentQuests) {
            const questsTypeBranches = this.data.currentQuests[questsType];
            for (const branchQuest in questsTypeBranches) {
                const quest = questsTypeBranches[branchQuest];
                console.log(this.client.RPGAssetsManager.getQuest(this.lang, quest.id));
            }
        }
    }
}

module.exports = QuestData;