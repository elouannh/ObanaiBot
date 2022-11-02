require("dotenv").config();
const obanai = new (require("./base/Obanai"))();

obanai.internalServerManager.addOwner("539842701592494111");

const newValue = obanai.inventoryDb.addMoney("539842701592494111", 4);
// console.log(newValue);