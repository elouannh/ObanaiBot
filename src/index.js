const obanai = new (require("./base/Obanai"))();

obanai.internalServerManager.set("main", ["539842701592494111"], "staff.owners");
obanai.internalServerManager.set("main", ["539842701592494111"], "staff.administrators");
obanai.internalServerManager.set("main", ["539842701592494111"], "staff.moderators");

obanai.questDb.load("539842701592494111").then((data) => {
    console.log(data);
});