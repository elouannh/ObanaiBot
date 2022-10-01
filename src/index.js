const obanai = new (require("./base/Obanai"))();
const fs = require("fs");

obanai.internalServerManager.set("main", ["539842701592494111"], "staff.owners");
obanai.internalServerManager.set("main", ["539842701592494111"], "staff.administrators");
obanai.internalServerManager.set("main", ["539842701592494111"], "staff.moderators");

const dataSchema = {
    "id": "slayer.0.0.0",
    "objectives": {
        "0": {
            "completed": false,
            "rewardsCollected": false,
            "additionalData": {},
        },
        "1": {
            "completed": true,
            "rewardsCollected": false,
            "additionalData": {},
        },
    },
};
obanai.questDb.set("539842701592494111", {}, "currentQuests.slayerQuest");
obanai.questDb.set("539842701592494111", { "main": dataSchema }, "currentQuests.slayerQuest");

obanai.questDb.load("539842701592494111").then((data) => {
    // fs.writeFileSync(
    //     "./src/test.json",
    //     JSON.stringify(data, null, 4),
    //     "utf-8",
    // );
});