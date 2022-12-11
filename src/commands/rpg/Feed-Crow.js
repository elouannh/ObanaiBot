const Command = require("../../base/Command");

class FeedCrow extends Command {
    constructor() {
        super({
            name: "feed-crow",
            description: "Permet de nourrir son corbeau kasugai.",
            descriptionLocalizations: {
                "en-US": "Allows you to feed your kasugai crow.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
            completedRequests: ["feed-crow"],
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
        await this.interaction.editReply({ content: this.lang.systems.currentlyInDevelopment, ephemeral: true });
        return this.end();
    }
}

module.exports = FeedCrow;