const Command = require("../base/Command");

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (message, client) => {
        if (message.author.bot) return;
        if (message.guild.id !== "958430837068681236" && !client.config.owners.includes(message.author.id)) return;

        const guildPrefix = await client.guildDb.get(message.guild.id);
        if (!message.content.startsWith(guildPrefix.prefix)) return;

        const args = message.content.replace(guildPrefix.prefix, "").split(/ +/);
        const commandName = args.shift();
        let cmd = client.commandManager.getCommand(commandName);

        if (cmd !== 0) {
            cmd.init(client, message, args);

            const cooldownReady = await cmd.cooldownReady(client, message, true);
            if (!cooldownReady) return;

            const requestReady = await cmd.requestReady(client, message);
            if (!requestReady) return;

            const permissionsReady = await cmd.permissionsReady(client, message);
            if (!permissionsReady) return;

            const clientPermissionsReady = await cmd.clientPermissionsReady(client, message);
            if (!clientPermissionsReady) return;

            if (cmd.infos.ownerOnly && !client.config.owners.includes(message.author.id)) return;

            if (await client.commandManager.isOverloaded()) return message.channel.send("Le bot est actuellement surchargé, veuillez réessayer plus tard.");

            client.lastChannel.set(message.author.id, message.channel);
            client.requests.get(message.author.id).set(message.id,
                { req: cmd.infos.name, src: `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}` },
            );
            await cmd.run();
            client.requests.get(message.author.id).delete(message.id);
        }
        else if (message.content.startsWith(`<@${client.user.id}>`)) {
            cmd = new Command();
            cmd.init(client, message, args);
            await cmd.ctx.reply(
                "Bonjour !",
                `Je suis Obanai. Mon préfixe sur ce serveur est \`${guildPrefix.prefix}\`. Tu peux voir la liste de mes commandes en faisant \`${guildPrefix.prefix}help\`.`,
                null,
                null,
                "info",
            );
        }
    },
};