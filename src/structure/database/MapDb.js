const Enmap = require("enmap");

class MapDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "mapDb" });
    }

    model(id) {
        const datas = {
            id: id,
            region: 4,
            area: 0,
            exploration: {},
        };

        return datas;
    }

    async ensure(id) {
        const p = this.model(id);
        this.db.ensure(id, p);

        return this.db.get(id);
    }

    async get(id) {
        this.ensure(id);

        return this.db.get(id);
    }
}

module.exports = { MapDb };