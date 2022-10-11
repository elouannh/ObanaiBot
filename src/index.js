const obanai = new (require("./base/Obanai"))();

obanai.questDb.load("539842701592494111").then(() => {
    // console.log(data.currentQuests.slayerQuest[0].objectives);
});

obanai.questDb.updateSlayerQuest("539842701592494111").then(() => null);