module.exports = {
    name: "guildDelete",
    once: false,
    run: async (guild, client) => {

        if (guild.memberCount >= 30) {
            await client.supportProgress("add", guild);
        }
        else if (client.internalServerManager.servers.includes(guild.id)) {
            await client.supportProgress("add", guild);
        }
    },
};