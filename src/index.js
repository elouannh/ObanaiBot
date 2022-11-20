require("dotenv").config();
const fs = require("fs");
const obanai = new (require("./base/Obanai"))();

obanai.internalServerManager.addOwner("539842701592494111");

obanai.inventoryDb.set("539842701592494111", "adventurer", "enchantedGrimoire.id");
obanai.inventoryDb.set("539842701592494111", 1668939557000, "enchantedGrimoire.activeSince");
obanai.inventoryDb.set("539842701592494111", "dove", "kasugaiCrow.id");

obanai.inventoryDb.set("539842701592494111", 3, "items.enchantedGrimoires.adventurer");
obanai.inventoryDb.set("539842701592494111", 2, "items.enchantedGrimoires.economist");
obanai.inventoryDb.set("539842701592494111", 1, "items.enchantedGrimoires.eternal");

obanai.inventoryDb.delete("539842701592494111", "items.weapons.katana");
obanai.inventoryDb.delete("539842701592494111", "items.weapons.katana");
obanai.inventoryDb.delete("539842701592494111", "items.weapons.twinSword");

obanai.inventoryDb.set("539842701592494111", { "2": 1, "4": 1 }, "items.weapons.katana");
obanai.inventoryDb.set("539842701592494111", { "9": 2 }, "items.weapons.twinSword");

// obanai.playerDb.load("539842701592494111").then((player) => {
//     obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
// });

void obanai.launch();