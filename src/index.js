const obanai = new (require("./base/Obanai"))();

obanai.squadDb.foundByUser("0").then((data) => console.log(data));

// obanai.inventoryDb.load("583697022545297408").then((data) => {
//     console.log(data.items.materials);
// });