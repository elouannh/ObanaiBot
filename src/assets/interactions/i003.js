module.exports = {
    id: "i003",
    play: async command => {
        const lang = command.lang.interactions["i003"];

        await command.client.fooSend(
            command.interaction.channel,
            [lang.content.main, lang.content.sub],
            command.user,
        );
    },
};