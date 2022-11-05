require("dotenv").config();
const fs = require("fs");
const obanai = new (require("./base/Obanai"))();

obanai.internalServerManager.addOwner("539842701592494111");

obanai.playerDb.delete("539842701592494111");
obanai.playerDb.create("539842701592494111", "0");

obanai.playerDb.set("539842701592494111", 7800, "exp");
obanai.playerDb.set("539842701592494111", 4, "statistics.strength");
obanai.playerDb.set("539842701592494111", 2, "statistics.defense");
obanai.playerDb.set("539842701592494111", 7, "statistics.smartness");

obanai.playerDb.load("539842701592494111").then((player) => {
    obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
});

void obanai.launch();
// console.log(newValue);