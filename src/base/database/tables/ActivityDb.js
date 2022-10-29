const SQLiteTable = require("../../SQLiteTable");
const ActivityData = require("../dataclasses/ActivityData");

function schema(id) {
    return {
        id: id,
        training: {
            currentlyTraining: false,
            startedDate: 0,
            statistic: null,
        },
        travel: {
            currentlyTraveling: false,
            startedDate: 0,
            departurePoint: {
                regionId: null,
                areaId: null,
            },
            destination: {
                regionId: null,
                areaId: null,
            },
        },
        forge: {
            forgingSlots: {
                "0": {
                    id: "0",
                    startedDate: 0,
                    currentlyForging: false,
                    weapon: {
                        "id": null,
                        "rarity": null,
                    },
                },
                "1": {
                    id: "1",
                    startedDate: 0,
                    currentlyForging: false,
                    weapon: {
                        "id": null,
                        "rarity": null,
                    },
                },
                "2": {
                    id: "2",
                    startedDate: 0,
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
        return new ActivityData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }

}

module.exports = ActivityDb;