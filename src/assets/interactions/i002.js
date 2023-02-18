module.exports = {
    id: "i002",
    play: async command => {
        const lang = command.lang.interactions["i002"];

        await command.client.fooSend(
            command.interaction.channel,
            [lang.content.main, lang.content.sub],
            command.user,
        );
    },
};