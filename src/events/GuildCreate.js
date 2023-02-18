const { Events } = require("discord.js");
const Event = require("../base/Event");

class GuildCreate extends Event {
    constructor(client) {
        super({
            name: Events.GuildCreate,
            on: true,
        }, client);
    }

    async exe(guild) {
        const channel = await this.client.getChannel(this.client.config.guildsChannel, { foo: null });

        if (channel?.foo || false) return;

        await channel?.send({
            embeds: [
                this.client.classicEmbed(
                    this.client.mainLanguage.json.systems.newGuild
                        .replace("%MEMBERS", guild.memberCount)
                        .replace("%GUILD_ID", guild.id)
                        .replace("%GUILDS", (await this.client.guildsSize())),
                ),
            ],
        }).catch(this.client.catchError);
    }
}

module.exports = GuildCreate;