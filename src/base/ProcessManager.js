const { Collection } = require("discord.js");

class ProcessManager {
    constructor(client) {
        this.client = client;
        this.process = process;
        this.argv = new Collection();

        for (const argv of this.process.argv) {
            if (argv.includes("=")) {
                const [key, value] = argv.split("=");
                this.argv.set(key, value);
            }
        }
    }

    hasArgv(key) {
        return this.argv.has(key);
    }

    getArgv(key) {
        if (this.hasArgv(key)) {
            return this.argv.get(key);
        }
        else {
            return null;
        }
    }
}

module.exports = ProcessManager;