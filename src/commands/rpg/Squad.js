const Command = require("../../base/Command");

class Squad extends Command {
    constructor() {
        super({
            name: "squad",
            description: "Permet à l’utilisateur de voir son escouade.",
            descriptionLocalizations: {
                "en-US": "Allows the user to see his squad.",
            },
            options: [],
            type: [1, 2],
            dmPermission: true,
            category: "RPG",
            cooldown: 10,
            completedRequests: ["squad"],
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
        // development
        await this.interaction.deferReply().catch(this.client.catchError);
        await this.interaction.editReply({ content: this.lang.systems.currentlyInDevelopment, ephemeral: true });
        return this.end();
    }
}

module.exports = Squad;