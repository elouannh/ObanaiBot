const TableData = require("../../TableData");

class SquadData extends TableData {
    constructor(client, playerData, lang) {
        super(client, playerData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        this.data.date = `${(this.data.creationDate / 1000).toFixed(0)}`;
        delete this.data.creationDate;

        this.data.members = Array.from(this.data.members);
        this.data.details.founder = this.client.playerDb.get(this.data.details.founder);
        this.data.details.owner = this.client.playerDb.get(this.data.details.owner);
    }
}

module.exports = SquadData;