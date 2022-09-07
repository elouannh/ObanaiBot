const Event = require("../base/Event");

class Ready extends Event {
    constructor() {
        super({
            name: "ready",
            once: true,
        });
    }

    async exe(client, error) {
        if (error?.message === undefined) return;

        await client.throwError(error, "Origin: @Event.Error");
    }
}

module.exports = Ready;