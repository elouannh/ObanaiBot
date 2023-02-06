module.exports = async obanai => {
    const exists = await obanai.playerDb.exists("539842701592494111");
    if (!exists) void await obanai.playerDb.create("539842701592494111", "0", "fr");

    // const fs = require("fs");
    // obanai.playerDb.load("539842701592494111").then((player) => {
    //     obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
    // });

    // obanai.additionalDb.set("539842701592494111", {}, "rpg.tutorialProgress");

    // obanai.inventoryDb.set("539842701592494111", 100, "items.materials.wood");

    // obanai.questDb.updateSlayerProgression("539842701592494111", "0", "0", "0", null);
    // obanai.questDb.setSlayerQuest("539842701592494111", "0", "0", "0", "0");

    // obanai.mapDb.set("539842701592494111", {}, "exploration.excavated");
    // obanai.mapDb.explore("539842701592494111", "0", "0");
    // obanai.mapDb.get("539842701592494111");
    // obanai.mapDb.move("539842701592494111", "0", "0");

    // await obanai.activityDb.travel("539842701592494111", "0", "0", "1", "0");
    obanai.activityDb.set(
        "539842701592494111",
        {
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
        "travel",
    );
    // await obanai.activityDb.get("539842701592494111");

    // obanai.playerDb.addExp("539842701592494111", 10000);

    obanai.internalServerManager.addOwner("539842701592494111");
};