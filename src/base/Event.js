class Event {
    constructor(eventInfos = {
        name: "",
        once: true,
    }, client) {
        this.eventInfos = eventInfos;
        this.client = client;
    }

    async exe() {
        this.client.util.timelog(this.client.chalk.red("Default event (without configuration/implementation)."));
    }
}

module.exports = Event;