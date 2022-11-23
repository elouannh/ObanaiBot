require("dotenv").config();
const fs = require("fs");
const obanai = new (require("./base/Obanai"))();

obanai.internalServerManager.addOwner("539842701592494111");

obanai.inventoryDb.set("539842701592494111", "3", "weapon.rarity");

obanai.activityDb.set("539842701592494111", {
    id: 539842701592494111,
    training: {
        currentlyTraining: true,
        startedDate: 1669218827000,
        statistic: "strength",
    },
    travel: {
        currentlyTraveling: true,
        startedDate: 1669218827000,
        departurePoint: {
            regionId: "0",
            areaId: "1",
        },
        destination: {
            regionId: "1",
            areaId: "1",
        },
    },
    forge: {
        forgingSlots: {
            "0": {
                id: "0",
                startedDate: 1669218827000,
                currentlyForging: true,
                weapon: {
                    "id": "katana",
                    "rarity": "7",
                },
            },
            "1": {
                id: "1",
                startedDate: 1669218882000,
                currentlyForging: true,
                weapon: {
                    "id": "spikedFlailWithAxe",
                    "rarity": "4",
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
});

// obanai.playerDb.load("539842701592494111").then((player) => {
//     obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
// });

void obanai.launch();