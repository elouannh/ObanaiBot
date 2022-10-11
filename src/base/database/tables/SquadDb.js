const SQLiteTable = require("../../SQLiteTable");
const SquadData = require("../dataclasses/SquadData");

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
        const squadData = this.schema(this.idGenerator());
        squadData.members["0"] = founder;
        squadData.details = { squadName, founder, owner: founder };
        this.ensureInDeep(squadData.id, squadData);

        return this.get(squadData.id);
    }

    async load(id) {
        return new SquadData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }
}

module.exports = SquadDb;