const Enmap = require("enmap");

class ExternalServerDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "externalServerDb" });
    }

    model(id) {
        const datas = {
            id: id,
            grades: [],
            badges: [],
            daily: 0,
            claimed: [],
        };

        return datas;
    }

    async ensure(id) {
        const p = this.model(id, null);
        this.db.ensure(id, p);

        return this.db.get(id);
    }

    async get(id) {
        this.ensure(id);

        return this.db.get(id);
    }

    async addGrade(id, grade) {
        this.db.push(id, grade, "grades");
    }

    async addBadge(id, badge) {
        this.db.push(id, badge, "badges");
    }

}

module.exports = { ExternalServerDb };