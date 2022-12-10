const Command = require("../../base/Command");

class Delete extends Command {
    constructor() {
        super({
            name: "delete",
            description: "Permet à l’utilisateur de supprimer son aventure s' il en possède une.",
            descriptionLocalizations: {
                "en-US": "Allows the user to delete their adventure if they have one.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
            completedRequests: ["delete"],
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

module.exports = Delete;