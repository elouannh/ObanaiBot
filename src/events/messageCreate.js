async function executeCommand(client, message, prefix) {
    const args = message.content.replace(prefix, "").split(/ +/);
    const commandName = args.shift();
    let cmd = client.commandManager.getCommand(commandName);

    if (cmd === 0) return;

    cmd = new cmd();
    cmd.init(client, message, args, prefix);

    const cooldownReady = await cmd.cooldownReady(true);
    if (!cooldownReady) return;

    const requestReady = await cmd.requestReady();
    if (!requestReady) return;

    const permissionsReady = await cmd.permissionsReady();
    if (!permissionsReady) return;

    const clientPermissionsReady = await cmd.clientPermissionsReady();
    if (!clientPermissionsReady) return;

    const commandPrivateReady = await cmd.commandPrivateReady();
    if (!commandPrivateReady) return;

    const clientStatusReady = await cmd.clientStatusReady();
    if (!clientStatusReady) return;

    if (await client.commandManager.isOverloaded()) {
        return message.channel.send("Le bot est actuellement surchargé, veuillez réessayer plus tard.");
    }

    client.lastChannel.set(message.author.id, message.channel);
    client.requestsManager.add(message.author.id, { key: cmd.infos.name, value : Date.now() });
    await cmd.run();
    client.requestsManager.remove(message.author.id, cmd.infos.name);
}

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (message, client) => {
        if (message.author.bot) return;

        const guildPrefix = await client.guildDb.get(message.guild.id);

        if (message.content.startsWith(`<@${client.user.id}>`)) {
            message.content = "help";
            await executeCommand(client, message, guildPrefix.prefix);
        }
        else {
            const prefixes = [
                `${guildPrefix.prefix}`,
                "obanai",
                "oba",
                "obanai ",
                "oba ",
            ];

            for (const prf of prefixes) {
                if (message.content.toLowerCase().startsWith(prf)) {
                    await executeCommand(
                        client,
                        Object.assign(message, { content: message.content.replace(prf, guildPrefix.prefix) }),
                        guildPrefix.prefix,
                    );
                }
            }

        }

    },
};