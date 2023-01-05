module.exports = async obanai => {

    // console.log(obanai.RPGAssetsManager.getProbability("weapons", "0").singleRepeatPull(150));


    // const exists = await obanai.playerDb.exists("539842701592494111");
    // if (!exists) void await obanai.playerDb.create("539842701592494111", "0", "fr");

    // const fs = require("fs");
    // obanai.playerDb.load("539842701592494111").then((player) => {
    //     obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
    // });

    // obanai.inventoryDb.set("539842701592494111", "evolvedCrow", "kasugaiCrow.id");
    obanai.inventoryDb.set("539842701592494111", 100, "items.materials.tamahagane");
    obanai.inventoryDb.set("539842701592494111", 10, "items.materials.wood");
    obanai.inventoryDb.set("539842701592494111", 1, "items.materials.weaponBase");

    // obanai.questDb.updateSlayerProgression("539842701592494111", "0", "0", "0", null);
    // obanai.questDb.setSlayerQuest("539842701592494111", "0", "0", "0", "0");


    obanai.internalServerManager.addOwner("539842701592494111");
};