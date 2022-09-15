const SQLiteTable = require("../../SQLiteTable");
const MapDatas = require("../subclasses/MapDatas");

function schema(id) {
    return {
        id: id,
        regionId: "0",
        areaId: "0",
        exploration: {},
    };
}

class MapDb extends SQLiteTable {
    constructor(client) {
        super(client, "map", schema);
    }

    async load(id) {
        return new MapDatas(this.client, this.get(id), this.client.playerDb.getLang(id));
    }
}

module.exports = MapDb;