const fs = require("fs");

const Regions = fs.readdirSync("./src/elements/map").map(r => require(`./map/${r}`));

module.exports = { Regions };