const { Collection } = require("discord.js");
const { token } = require("../token.json");
const Obanai = require("./base/Obanai");

const registerSlash = process.argv
    .filter(arg => arg.startsWith("--register_slash="))
    .map(arg => arg.split("=")[1])[0];

const renderTranslations = process.argv
    .filter(arg => arg.startsWith("--render_translations="))
    .map(arg => arg.split("=")[1])[0];

const client = new Obanai(token, registerSlash, renderTranslations);

client.log("Starting bot process...");
client.lastChannel = new Collection();
client.launch();