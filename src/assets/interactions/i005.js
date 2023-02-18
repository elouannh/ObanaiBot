module.exports = {
    id: "i005",
    play: async command => {
        const lang = command.lang.interactions["i005"];

        await command.client.fooSend(
            command.interaction.channel,
            [lang.content.main, lang.content.sub],
            command.user,
        );
    },
};