const { Collection } = require("discord.js");
const Enmap = require("enmap");
const { token } = require("../token.json");
const Obanai = require("./base/Obanai");
const { loadEvents } = require("./utils/eventLoader");


const client = new Obanai(token);
// ................<string, Collection<string, Date>>
client.cooldowns = new Collection();
// ................<string, Collection<string, string>>
client.requests = new Collection();
// ................<string, Channel>
client.lastChannel = new Collection();

client.AVAILABLE = new Enmap({ name: "AVAILABLE" });

loadEvents(client);
client.launch();