const obanai = new (require("./base/Obanai"))();

obanai.internalServerManager.set("main", ["539842701592494111"], "staff.owners");
obanai.internalServerManager.set("main", ["539842701592494111"], "staff.administrators");
obanai.internalServerManager.set("main", ["539842701592494111"], "staff.moderators");

const datas = {
    "id": "slayer.0.0.0",
    "objectives": {
        "0": {
            "completed": false,
            "additionalData": {},
        },
        "1": {
            "completed": true,
            "additionalData": {},
        },
    },
};
obanai.questDb.set("539842701592494111", {}, "currentQuests.slayerQuest");
obanai.questDb.set("539842701592494111", { "main": datas }, "currentQuests.slayerQuest");

obanai.questDb.load("539842701592494111").then((data) => {
    console.log(data.currentQuests.slayerQuest);
});