require("dotenv").config();
const obanai = new (require("./base/Obanai"))();

const newValue = obanai.inventoryDb.addMoney("539842701592494111", 4);
// console.log(newValue);