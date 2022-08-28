const Enmap = require("enmap");

class QuestDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "questDb" });
    }

    model(id) {
        const datas = {
            id: id,
            daily: [],
            slayer: [],
            world: [],
            storyProgress: {
                "chapter": 0,
                "quest": 1,
                "step": 0,
            },
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

module.exports = QuestDb;