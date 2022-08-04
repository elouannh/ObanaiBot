const { Collection, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

class EventManager {

    constructor(client, dir = "./src/events/") {
        this.client = client;
        this.dir = dir;
    }

    loadFiles() {
        if (this.client.registerSlash) {
            const eventFolder = fs.readdirSync(this.dir);
            eventFolder.forEach(file => {
                const event = new (require(`../events/${file}`))();
                if (event.eventInfos.once) {
                    this.client.once(event.eventInfos.name, (...args) => event.exe(this.client, ...args));
                }
                else {
                    this.client.on(event.eventInfos.name, (...args) => event.exe(this.client, ...args));
                }
            });
        }
    }
}

module.exports = EventManager;