const SQLiteTable = require("../../SQLiteTable");
const SquadDatas = require("../subclasses/SquadDatas");

function schema(id) {
    return {
        id: id,
        members: {},
        details: {
            name: "",
            founder: "",
            owner: "",
        },
        creationDate: Date.now(),
    };
}

class SquadDb extends SQLiteTable {
    constructor(client) {
        super(client, "squad", schema);
    }

    idGenerator() {
        if (this.db.count === 0) {
            return "0";
        }
        else {
            return Array.from(this.db.keys()).sort((a, b) => b - a)[0];
        }
    }

    async create(squadName, founder) {
        const squadDatas = this.schema(this.idGenerator());
        squadDatas.members["0"] = founder;
        squadDatas.details = { squadName, founder, owner: founder };
        this.ensureInDeep(squadDatas.id, squadDatas);

        return this.get(squadDatas.id);
    }

    async load(id) {
        return new SquadDatas(this.client, this.get(id), this.client.playerDb.getLang(id));
    }
}

module.exports = SquadDb;