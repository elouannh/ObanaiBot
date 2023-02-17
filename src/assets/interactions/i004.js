module.exports = {
    id: "i004",
    play: async command => {
        const lang = command.lang.interactions[this.id];

        await command.client.fooSend(
            command.interaction.channel,
            [lang.content.main, lang.content.sub],
            command.user,
        );
    },
};