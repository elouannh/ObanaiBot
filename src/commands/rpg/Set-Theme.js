const Command = require("../../base/Command");

class SetTheme extends Command {
    constructor() {
        super({
            name: "set-theme",
            description: "Permet d’équiper un thème débloqué à un endroit.",
            descriptionLocalizations: {
                "en-US": "Allows you to equip an unlocked theme in one place.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 10,
            completedRequests: ["set-theme"],
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

module.exports = SetTheme;