class Event {
    constructor(eventInfos = {
        name: "ready",
        once: true,
    }) {
        this.eventInfos = eventInfos;
        this.client = null;
    }

    init(client) {
        this.client = client;
    }

    async exe() {
        console.log("default event (without configuration/implementation)");
    }
}

module.exports = Event;