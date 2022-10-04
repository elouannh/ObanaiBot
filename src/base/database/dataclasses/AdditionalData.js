const TableData = require("../../TableData");

class AdditionalData extends TableData {
    constructor(client, playerData, lang) {
        super(client, playerData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {

    }
}

module.exports = AdditionalData;