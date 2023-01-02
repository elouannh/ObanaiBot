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
            completedRequests: ["adventure"],
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

        const firstResponse = await this.choice(
            {
                content: this.mention + this.trad.firstContent,
            },
            this.trad.deleteButton,
            this.trad.cancelButton,
        );
        if (firstResponse === null) return this.end();

        if (firstResponse === "secondary") {
            await this.interaction.editReply({
                content: this.mention + this.trad.notDeleted,
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }

        const secondResponse = await this.choice(
            {
                content: this.mention + this.trad.secondContent,
            },
            this.trad.deleteDefinitivelyButton,
            this.trad.cancelButton,
        );
        if (secondResponse === null) return this.end();

        if (secondResponse === "secondary") {
            await this.interaction.editReply({
                content: this.mention + this.trad.notDeleted,
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
        else {
            await this.client.playerDb.remove(user.id);
            await this.interaction.editReply({
                content: this.mention + this.trad.deleted,
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
    }
}

module.exports = Delete;