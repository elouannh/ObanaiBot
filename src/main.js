module.exports = async obanai => {
    const exists = await obanai.playerDb.exists("539842701592494111");
    if (!exists) void await obanai.playerDb.create("539842701592494111", "0", "fr");

    // const fs = require("fs");
    // obanai.playerDb.load("539842701592494111").then((player) => {
    //     obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
    // });

    // obanai.additionalDb.set("539842701592494111", {}, "rpg.tutorialProgress");

    obanai.inventoryDb.set("539842701592494111", 100, "items.materials.wood");
    obanai.inventoryDb.set("539842701592494111", 100, "items.materials.weaponBase");
    obanai.inventoryDb.set("539842701592494111", 100, "items.materials.tamahagane");

    // obanai.questDb.updateSlayerProgression("539842701592494111", "0", "0", "0", null);
    // obanai.questDb.setSlayerQuest("539842701592494111", "0", "0", "0", "0");

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
    //             regionId: null,
    //             areaId: null,
    //         },
    //         destination: {
    //             regionId: null,
    //             areaId: null,
    //         },
    //     },
    //     "travel",
    // );
    await obanai.activityDb.get("539842701592494111");

    let req = 0;
    for (let i = 0; i < 100; i++) {
        while (i >= obanai.RPGAssetsManager.getPlayerLevel(req).level) {
            req += 10;
        }

        console.log("Niveau:", i + 1, " | Exp total requis:", req);
        const n = i + 1;
        console.log(25*n**2 + 75*n);
    }

    // obanai.playerDb.addExp("539842701592494111", 10000);

    obanai.internalServerManager.addOwner("539842701592494111");
};