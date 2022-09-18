const TableDatas = require("../../TableDatas");

class QuestDatas extends TableDatas {
    constructor(client, questDatas, lang) {
        super(client, questDatas);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        return 0;
    }
}

module.exports = QuestDatas;