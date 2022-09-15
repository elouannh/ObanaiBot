const TableDatas = require("../../TableDatas");

class SquadDatas extends TableDatas {
    constructor(client, playerDatas, lang) {
        super(client, playerDatas);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        this.datas.date = `${(this.datas.creationDate / 1000).toFixed(0)}`;
        delete this.datas.creationDate;

        this.datas.members = Array.from(this.datas.members);
        this.datas.details.founder = this.client.playerDb.get(this.datas.details.founder);
        this.datas.details.owner = this.client.playerDb.get(this.datas.details.owner);
    }
}

module.exports = SquadDatas;