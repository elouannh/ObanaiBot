const SQLiteTable = require("./SQLiteTable");
const ActivityDatas = require("../subclasses/ActivityDatas");

function schema(id) {
    return {
        id: id,
        training: {
            currentlyTraining: false,
            startedDate: 0,
            stats: null,
        },
        travel: {
            currentlyTraveling: false,
            startedDate: 0,
            destination: 0,
        },
        forge: {
            forgingSlots: {
                "0": {
                    id: "0",
                    currentlyForging: false,
                    weapon: {
                        "id": null,
                        "rarity": null,
                    },
                },
                "1": {
                    id: "1",
                    currentlyForging: false,
                    weapon: {
                        "id": null,
                        "rarity": null,
                    },
                },
                "2": {
                    id: "2",
                    currentlyForging: false,
                    weapon: {
                        "id": null,
                        "rarity": null,
                    },
                },
            },
        },
    };
}

class ActivityDb extends SQLiteTable {
    constructor(client) {
        super(client, "activity", schema);
    }

    async load(id) {
        return new ActivityDatas(this.client, this.get(id));
    }

}

module.exports = ActivityDb;