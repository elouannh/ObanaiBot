const obanai = new (require("./base/Obanai"))();

obanai.questDb.load("539842701592494111").then(() => {
    // console.log(data.currentQuests.slayerQuest[0].objectives);
});

console.log(obanai.playerDb.get("539842701592494111").statistics);
console.log(obanai.questDb.get("539842701592494111").currentQuests.slayerQuest.main.objectives);
obanai.questDb.refreshSlayerQuestObjectives("539842701592494111").then(() => {
    console.log(obanai.questDb.get("539842701592494111").currentQuests.slayerQuest.main.objectives);
});