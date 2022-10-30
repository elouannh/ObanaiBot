const Command = require("../../base/Command");
const { EmbedBuilder } = require("discord.js");

class Profile extends Command {
    constructor() {
        super({
            name: "profile",
            description: "Commande permettant d'afficher les informations d'un joueur.",
            descriptionLocalizations: {
                "en-US": "Command to display player informations.",
            },
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "Joueur dont vous souhaitez afficher les informations.",
                    descriptionLocalizations: {
                        "en-US": "Player whose informations you want to display.",
                    },
                    required: false,
                },
            ],
            type: [1, 2],
            dmPermission: true,
            category: "RPG",
            cooldown: 5,
            completedRequests: ["profile"],
            authorizationBitField: 0b000,
            permissions: 0n,
        });
    }

    async run() {
        const user = await this.getUserFromInteraction(this.interaction.type);
        if (!(await this.client.playerDb.exists(user.id))) await this.client.playerDb.create(user.id);
        const player = await this.client.playerDb.load(user.id);

        const embed = new EmbedBuilder()
            .setColor(this.client.enums.Colors.Blurple)
            .setTitle(this.lang.commands.profile.mainTitle);
        await this.interaction.reply({ embeds: [embed] }).catch(this.client.util.catchError);
    }
}

module.exports = Profile;