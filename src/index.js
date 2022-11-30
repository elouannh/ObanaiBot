require("dotenv").config();
const fs = require("fs");
const obanai = new (require("./base/Obanai"))();

obanai.playerDb.exists("539842701592494111").then(data => {
    if (!data) void obanai.playerDb.create("539842701592494111", "0", "fr");
});

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
obanai.questDb.set("539842701592494111", data, "currentQuests.slayerQuest.main");

obanai.playerDb.set("539842701592494111", 5, "statistics.strength");

obanai.questDb.isQuestCompleted(
    "539842701592494111",
    obanai.questDb.get("539842701592494111")?.currentQuests?.slayerQuest?.["main"],
    obanai.RPGAssetsManager.quests.slayerQuests["0"]["0"]["0"],
    "playerDb",
).then(null);

obanai.internalServerManager.addOwner("539842701592494111");

void obanai.launch();