const Command = require("../../base/Command");

class SetWeapon extends Command {
    constructor() {
        super({
            name: "set-weapon",
            description: "Permet d’équiper une arme de votre inventaire.",
            descriptionLocalizations: {
                "en-US": "Allows you to equip a weapon from your inventory.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
            completedRequests: ["set-weapon"],
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

module.exports = SetWeapon;