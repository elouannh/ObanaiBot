module.exports ={
    id: "i001",
    play: async command => {
        await command.interaction.channel.send({
            content: "`\"Action aléatoire faisant partie de l'interaction\"`",
        }).catch(command.client.catchError);
    },
};