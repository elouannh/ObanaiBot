const TableData = require("../../TableData");

class QuestData extends TableData {
    constructor(client, questData, lang) {
        super(client, questData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        return 0;
    }
}

module.exports = QuestData;