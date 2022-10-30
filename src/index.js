require("dotenv").config();
const obanai = new (require("./base/Obanai"))();

// obanai.questDb.load("1").then((quest) => {
//     console.log(quest);
// });
//
const newValue = obanai.inventoryDb.addMoney("539842701592494111", 4);
console.log(newValue);

// obanai.inventoryDb.load("583697022545297408").then((data) => {
//     console.log(data.items.materials);
// });