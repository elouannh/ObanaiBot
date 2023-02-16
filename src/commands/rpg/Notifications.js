const Command = require("../../base/Command");

class Profile extends Command {
    constructor() {
        super(
            {
                name: "notifications",
                description: "Permet à l'utilisateur de gérer les paramètres de notifications.",
                descriptionLocalizations: {
                    "en-US": "Allows the user to manage the notification settings.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Notifications",
            },
            {
                trad: "profile",
                type: [1, 2],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["profile"],
                authorizationBitField: 0b000,
                permissions: 0n,
                targets: ["read"],
            },
            {
                needToBeStatic: false,
                needToBeInRpg: true,
            },
        );
    }

    async run() {
    }
}

module.exports = Profile;