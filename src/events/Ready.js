const { ActivityType, Events } = require("discord.js");
const Event = require("../base/Event");

class Ready extends Event {
    constructor(client) {
        super({
            name: Events.ClientReady,
            once: true,
        }, client);
    }

    async exe() {
        this.client.commandManager.loadFiles();
        this.client.util.timelog(`Bot connecté en tant que ${this.client.chalk.bold(this.client.user.tag)} !`);

        this.client.user.setPresence({
            activities: [
                { name: `🔌 Loading ${(await this.client.guildsSize())} guilds...`, type: ActivityType.Playing },
            ],
            status: "dnd",
        });

        try {
            let statusIndex = 0;
            setInterval(() => {
                const activities = [
                    { name: "🌐 International", type: ActivityType.Competing },
                    { name: `Version ${this.client.version}`, type: ActivityType.Watching },
                ];
                this.client.user.setPresence({
                    activities: [activities[statusIndex]],
                    status: "online",
                });
                statusIndex += (statusIndex === (activities.length - 1) ? -statusIndex : 1);
            }, 15_000);

            try {
                await this.client.internalServerManager.questGenerator();
            }
            catch (err) {
                await this.client.throwError(err, "Origin: @Ready.InternalServerManager");
            }
        }
        catch (err) {
            await this.client.throwError(err, "Origin: @Event.Ready");
        }
    }
}

module.exports = Ready;