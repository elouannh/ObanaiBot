module.exports = {
    name: "guildDelete",
    once: false,
    run: async (guild, client) => {

        if (guild.memberCount >= 30) {
            await client.supportProgress("remove", guild);
        }
        else if (client.internalServerManager.servers.includes(guild.id)) {
            await client.supportProgress("remove", guild);
        }
    },
};