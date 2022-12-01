require("dotenv").config();
const obanai = new (require("./base/Obanai"))();
const main = require("./main");

void main(obanai);

void obanai.launch();