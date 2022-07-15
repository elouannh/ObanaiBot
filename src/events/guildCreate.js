module.exports = {
    name: "guildCreate",
    once: false,
    run: async (guild, client) => {

        if (guild.memberCount < 30 && !client.internalServerManager.servers.includes(guild.id)) {
            try {
                guild.leave();
            }
            catch {
                "que dalle";
            }
        }
        else {
            await client.supportProgress("add", guild);
        }
    },
};