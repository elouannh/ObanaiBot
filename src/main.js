module.exports = async obanai => {

    console.log(obanai.RPGAssetsManager.getProbability("weapons", "0").singleRepeatPull(150));
    console.log(obanai.RPGAssetsManager.getProbability("weapons", "1").singleRepeatPull(150));
    console.log(obanai.RPGAssetsManager.getProbability("weapons", "2").singleRepeatPull(150));
    console.log(obanai.RPGAssetsManager.getProbability("weapons", "3").singleRepeatPull(150));
    console.log(obanai.RPGAssetsManager.getProbability("weapons", "4").singleRepeatPull(150));


    // const exists = await obanai.playerDb.exists("539842701592494111");
    // if (!exists) void await obanai.playerDb.create("539842701592494111", "0", "fr");

    // const fs = require("fs");
    // obanai.playerDb.load("539842701592494111").then((player) => {
    //     obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
    // });

    // obanai.inventoryDb.set("539842701592494111", "evolvedCrow", "kasugaiCrow.id");
    // obanai.inventoryDb.set("539842701592494111", 0, "items.materials.seed");
    // obanai.inventoryDb.set("539842701592494111", 0, "items.materials.worm");
    //
    // obanai.questDb.updateSlayerProgression("539842701592494111", "0", "0", "0", null);
    // obanai.questDb.setSlayerQuest("539842701592494111", "0", "0", "0", "0");


    obanai.internalServerManager.addOwner("539842701592494111");
};