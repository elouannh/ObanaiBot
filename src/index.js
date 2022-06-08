const { Collection } = require("discord.js");
const { token } = require("../token.json");
const Dapan = require("./base/Dapan");
const { loadEvents } = require("./utils/eventLoader");


const client = new Dapan(token);
// ................<string, Collection<string, Date>>
client.cooldowns = new Collection();
// ................<string, Collection<string, string>>
client.requests = new Collection();
// ................<string, Channel>
client.lastChannel = new Collection();

loadEvents(client);
client.launch();