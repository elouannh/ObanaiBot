const Event = require("../base/Event");

class GuildCreate extends Event {
    constructor() {
        super({
            name: "guildCreate",
            once: false,
        });
    }

    async exe(client, guild) {
        if (guild.memberCount < 30 && !client.internalServerManager.servers.includes(guild.id)) {
            try {
                await guild.leave();
            }
            catch {
                "que dalle";
            }
        }
        else {
            // await client.supportProgress("add", guild);
        }
    }
}

module.exports = GuildCreate;