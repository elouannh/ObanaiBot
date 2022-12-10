const Command = require("../../base/Command");

class Interact extends Command {
    constructor() {
        super({
            name: "interact",
            description: "Permet d’interagir avec l’environnement; peut déclencher un dialogue, un combat, fouiller la zone...",
            descriptionLocalizations: {
                "en-US": "Allows you to interact with the environment; can trigger a dialogue, a fight, search the area...",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
            completedRequests: ["interact"],
            authorizationBitField: 0b000,
            permissions: 0n,
        });
    }

    async run() {
        const user = this.interaction.user;
        if (!(await this.client.playerDb.exists(user.id))) {
            if (this.client.playerDb.get(user.id).alreadyPlayed) {
                await this.interaction.reply({
                    content: this.lang.systems.playerNotFoundAlreadyPlayed,
                    ephemeral: true,
                }).catch(this.client.catchError);
                return this.end();
            }
            await this.interaction.reply({ content: this.lang.systems.playerNotFound, ephemeral: true })
                .catch(this.client.catchError);
            return this.end();
        }
        await this.interaction.deferReply().catch(this.client.catchError);
        await this.interaction.editReply({ content: this.lang.systems.currentlyInProgramming, ephemeral: true });
        return this.end();
    }
}

module.exports = Interact;