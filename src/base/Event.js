class Event {
    constructor(eventInfos = {
        name: "ready",
        once: true,
    }, client) {
        this.eventInfos = eventInfos;
        this.client = client;
    }

    async exe() {
        console.log("default event (without configuration/implementation)");
    }
}

module.exports = Event;