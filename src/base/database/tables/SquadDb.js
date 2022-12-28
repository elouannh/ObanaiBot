const SQLiteTable = require("../../SQLiteTable");
const SquadListener = require("../listeners/SquadListener");
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
        super(client, "squad", schema, SquadListener);
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
        this.set(squadData.id, squadData);

        return this.get(squadData.id);
    }

    async load(id) {
        return new SquadData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }

    async loadUser(id) {
        const squad = this.db.find(sq => Object.values(sq.members).includes(id))?.at(0) ?? null;

        if (squad === null) return null;

        return await this.load(squad.id);
    }

    async foundByUser(id) {
        const squads = this.db.filter(sq => Object.values(sq.members).includes(id));

        return Array.from(squads);
    }

    async hasSquad(id) {
        const squads = this.db.find(sq => Object.values(sq.members).includes(id))?.at(0) ?? null;

        return squads !== null;
    }

    removeMember(id, member) {
        const squadData = this.get(id);
        const members = squadData.members;
        for (const key in members) {
            if (members[key] === member) {
                delete members[key];
                break;
            }
        }
        this.set(id, members, "members");
        if (squadData.details.owner === member) {
            this.set(id, Object.values(members)[0], "details.owner");
        }
    }
}

module.exports = SquadDb;