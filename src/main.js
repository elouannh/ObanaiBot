module.exports = async obanai => {
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

    await obanai.playerDb.set("539842701592494111", 1, "statistics.strength");
    await obanai.playerDb.set("539842701592494111", 1, "statistics.defense");
    await obanai.questDb.set("539842701592494111", "last", "notifications");
    await obanai.questDb.set("539842701592494111", data, "currentQuests.slayerQuest");
    await obanai.questDb.set("539842701592494111", ["0", "0", null], "storyProgression");

    obanai.internalServerManager.addOwner("539842701592494111");
};