const fs = require("fs");

const Regions = fs.readdirSync("./src/elements/map").map(r => require(`./map/${r}`));

const BiomesEmojis = {
    "meadow": "🍃",
    "forest": "🌳",
    "dark_forest": "🍂",
    "dwelling": "🏠",
    "developed_area": "🏙️",
    "rockyArea": "🏔️",
};

module.exports = { Regions, BiomesEmojis };