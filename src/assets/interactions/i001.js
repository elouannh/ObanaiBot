module.exports = {
    id: "i001",
    play: async command => {
        const lang = command.lang.interactions["i001"];

        await command.client.fooSend(
            command.interaction.channel,
            [lang.content.main, lang.content.sub],
            command.user,
        );
    },
};