module.exports = async obanai => {
    const exists = await obanai.playerDb.exists("539842701592494111");
    if (!exists) void await obanai.playerDb.create("539842701592494111", "0", "fr");

    obanai.questDb.setSlayerQuest("539842701592494111", "0", "0", "0", "0");

    setTimeout(async () => {
        obanai.mapDb.set("539842701592494111", "1", "areaId");
    }, 2000);

    obanai.internalServerManager.addOwner("539842701592494111");
};