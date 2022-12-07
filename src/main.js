module.exports = async obanai => {
    const exists = await obanai.playerDb.exists("539842701592494111");
    if (!exists) void await obanai.playerDb.create("539842701592494111", "0", "fr");

    obanai.internalServerManager.addOwner("539842701592494111");
};