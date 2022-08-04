const Event = require("../base/Event");

class GuildDelete extends Event {
    constructor() {
        super({
            name: "guildDelete",
            once: false,
        });
    }

    async exe(client, guild) {
        if (guild.memberCount >= 30) {
            // await client.supportProgress("remove", guild);
        }
        else if (client.internalServerManager.servers.includes(guild.id)) {
            // await client.supportProgress("remove", guild);
        }
    }
}

module.exports = GuildDelete;