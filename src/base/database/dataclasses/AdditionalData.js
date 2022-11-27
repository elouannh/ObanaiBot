const TableData = require("../../TableData");

class AdditionalData extends TableData {
    constructor(client, playerData, lang) {
        super(client, playerData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        this.data.rpg.tutorialProgressStats = this.client.additionalDb.getTutorialProgress(this.lang, this.data.id);
    }
}

module.exports = AdditionalData;