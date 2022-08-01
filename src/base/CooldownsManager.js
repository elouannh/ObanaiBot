const { Collection } = require("discord.js");

class CooldownsManager {
    constructor (client) {
        this.client = client;
        this.cooldowns = new Collection();
    }


}

module.exports = CooldownsManager;