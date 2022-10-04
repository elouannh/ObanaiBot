const SQLiteTable = require("../../SQLiteTable");
const StatisticData = require("../dataclasses/StatisticData");

function schema(id) {
    return {
        id: id,
        commands: {},
        tutorial: {},
    };
}

class StatisticDb extends SQLiteTable {
    constructor(client) {
        super(client, "statistic", schema);
    }

    async load(id) {
        return new StatisticData(this.client, this.get(id));
    }
}

module.exports = StatisticDb;