const Command = require("../base/Command");

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

    if (await client.commandManager.isOverloaded()) return message.channel.send("Le bot est actuellement surchargé, veuillez réessayer plus tard.");

    client.lastChannel.set(message.author.id, message.channel);
    client.requests.get(message.author.id).set(message.id,
        { req: cmd.infos.name, src: `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}` },
    );
    await cmd.run();
    client.requests.get(message.author.id).delete(message.id);
}

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (message, client) => {
        if (message.author.bot) return;

        const guildPrefix = await client.guildDb.get(message.guild.id);

        if (message.content.startsWith(`<@${client.user.id}>`)) {
            const cmd = new Command();
            const args = message.content.split(/ +/);
            cmd.init(client, message, args);
            await cmd.ctx.reply(
                "Bonjour !",
                `Je suis Obanai. Mon préfixe sur ce serveur est \`${guildPrefix.prefix}\`. Tu peux voir la liste de mes commandes en faisant \`${guildPrefix.prefix}help\`.`,
                null,
                null,
                "info",
            );
        }
        else {
            const prefixes = [
                `${guildPrefix.prefix}`,
                "obanai",
                "obanai ",
            ];

            for (const prf of prefixes) {
                if (message.content.toLowerCase().startsWith(prf.toLowerCase())) await executeCommand(client, message, prf);
            }
        }

    },
};