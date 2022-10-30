const Command = require("../../base/Command");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
} = require("discord.js");

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
                    nameLocalizations: {
                        "en-US": "user",
                    },
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
        const user = this.interaction.user;
        let userId = user.id;
        if (this.interaction.type === 1) userId = this.interaction.options?.get("joueur")?.user?.id;
        else if (this.interaction.type === 2) userId = this.client.users.cache.get(this.interaction.targetId);
        userId = (await this.client.getUser(userId, user)).userId;
    }
}

module.exports = Profile;