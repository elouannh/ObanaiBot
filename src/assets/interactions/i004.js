module.exports = {
    id: "i004",
    play: async command => {
        const lang = command.lang.interactions["i004"];

        await command.client.fooSend(
            command.interaction.channel,
            [lang.content.main, lang.content.sub],
            command.user,
        );
    },
};