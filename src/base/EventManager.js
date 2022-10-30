const fs = require("fs");

class EventManager {
    constructor(client, dir = "./src/events/") {
        this.client = client;
        this.dir = dir;
    }

    loadFiles() {
        const eventFolder = fs.readdirSync(this.dir);
        eventFolder.forEach(file => {
            const event = new (require(`../events/${file}`))(this.client);
            let method = "on";
            if (event.eventInfos.once) method += "ce";

            this.client[method](event.eventInfos.name, (...args) => {
                console.log(`Event ${event.eventInfos.name} triggered`);
                event.exe(...args);
            });
        });
    }
}

module.exports = EventManager;