require("dotenv").config();
const fs = require("fs");
const obanai = new (require("./base/Obanai"))();

obanai.internalServerManager.addOwner("539842701592494111");

obanai.inventoryDb.set("539842701592494111", "adventurer", "enchantedGrimoire.id");
obanai.inventoryDb.set("539842701592494111", "dove", "kasugaiCrow.id");

// obanai.playerDb.load("539842701592494111").then((player) => {
//     obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
// });

void obanai.launch();