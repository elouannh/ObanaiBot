require("dotenv").config();
const fs = require("fs");
const obanai = new (require("./base/Obanai"))();

obanai.internalServerManager.addOwner("539842701592494111");

obanai.playerDb.load("539842701592494111").then((player) => {
    obanai.playerDb.getImage(player).then((image) => fs.writeFileSync("./image.png", image.buffer));
});
// console.log(newValue);