const Command = require("../../base/Command");

class Train extends Command {
    constructor() {
        super(
            {
                name: "train",
                description: "Permet à l'utilisateur d'entraîner ses différentes aptitudes.",
                descriptionLocalizations: {
                    "en-US": "Allows the user to train their different skills.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Train",
                dmPermission: true,
            },
            {
                trad: "train",
                type: [1],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["adventureLocal"],
                authorizationBitField: 0b000,
                permissions: 0n,
            },
        );
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
    }
}

module.exports = Train;