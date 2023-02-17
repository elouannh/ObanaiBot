module.exports = async obanai => {
    // const exists = await obanai.playerDb.exists("539842701592494111");
    // if (!exists) void await obanai.playerDb.create("539842701592494111", "0", "fr");

    // const fs = require("fs");
    // obanai.playerDb.load("539842701592494111").then((player) => {
    //     obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
    // });

    // obanai.additionalDb.set("539842701592494111", {}, "rpg.tutorialProgress");

    // obanai.inventoryDb.set("539842701592494111", 100, "items.materials.wood");
    // obanai.inventoryDb.set("539842701592494111", 100, "items.materials.weaponBase");
    // obanai.inventoryDb.set("539842701592494111", 100, "items.materials.tamahagane");

    obanai.questDb.updateSlayerProgression("539842701592494111", "0", "0", "0", "1");
    obanai.questDb.setSlayerQuest("539842701592494111", "0", "0", "0", "2");

    // obanai.mapDb.set("539842701592494111", {}, "exploration.excavated");
    // obanai.mapDb.explore("539842701592494111", "0", "0");
    // obanai.mapDb.get("539842701592494111");
    // obanai.mapDb.move("539842701592494111", "0", "0");

    // await obanai.activityDb.travel("539842701592494111", Date.now(), "0", "0", "1", "0");
    // obanai.activityDb.set(
    //     "539842701592494111",
    //     {
    //         currentlyTraveling: false,
    //         startedDate: 0,
    //         departurePoint: {
    //             districtId: null,
    //             sectorId: null,
    //         },
    //         destination: {
    //             districtId: null,
    //             sectorId: null,
    //         },
    //     },
    //     "travel",
    // );
    // await obanai.activityDb.set("539842701592494111", {
    //     "0": {
    //         id: "0",
    //         startedDate: 0,
    //         currentlyForging: false,
    //         weapon: {
    //             "id": null,
    //             "rarity": null,
    //         },
    //     },
    //     "1": {
    //         id: "1",
    //         startedDate: 0,
    //         currentlyForging: false,
    //         weapon: {
    //             "id": null,
    //             "rarity": null,
    //         },
    //     },
    //     "2": {
    //         id: "2",
    //         startedDate: 0,
    //         currentlyForging: false,
    //         weapon: {
    //             "id": null,
    //             "rarity": null,
    //         },
    //     },
    // }, "forge.forgingSlots");
    // await obanai.activityDb.get("539842701592494111");

    // function getTime(min = 0, max = 100) {
    //     const time1 = Object.entries(obanai.RPGAssetsManager.statistics.trainingTimes)
    //         .filter(e => Number(e[0]) <= max)
    //         .reduce((a, b) => a + Number(b[1]), 0);
    //     const time2 = Object.entries(obanai.RPGAssetsManager.statistics.trainingTimes)
    //         .filter(e => Number(e[0]) <= min)
    //         .reduce((a, b) => a + Number(b[1]), 0);
    //     return time1 - time2;
    // }
    // obanai.playerDb.addExp("539842701592494111", 10000);

    obanai.internalServerManager.addOwner("539842701592494111");
};