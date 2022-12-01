module.exports = async obanai => {
    obanai.playerDb.set("539842701592494111", 5, "statistics.strength");

    const exists = await obanai.playerDb.exists("539842701592494111");
    if (!exists) void await obanai.playerDb.create("539842701592494111", "0", "fr");

    const data = {
        id: "slayer.0.0.0",
        objectives: {
            "0": {
                completed: false,
                rewardsCollected: false,
            },
            "1": {
                completed: false,
                rewardsCollected: false,
            },
        },
    };
    await obanai.questDb.set("539842701592494111", data, "currentQuests.slayerQuest");

    const verified = await obanai.questDb.verifyAllQuests("539842701592494111", "playerDb");

    console.log(obanai.questDb.get("539842701592494111").currentQuests.slayerQuest);

    obanai.internalServerManager.addOwner("539842701592494111");
};