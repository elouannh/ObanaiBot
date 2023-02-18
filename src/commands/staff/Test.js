const Command = require("../../base/Command");

class Profile extends Command {
    constructor() {
        super(
            {
                name: "test",
                description: "Commande permettant de tester un script prédéfini.",
                descriptionLocalizations: {
                    "en-US": "Command to test a predefined script.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Test",
            },
            {
                trad: "test",
                type: [1],
                category: "Staff",
                cooldown: 10,
                completedRequests: ["adventure"],
                authorizationBitField: 0b100,
                permissions: 0n,
                targets: ["read", "write"],
                cancelDefer: false,
            },
            {
                needToBeStatic: false,
                needToBeInRpg: false,
            },
        );
    }

    async run() {
        // this.client.questDb.updateSlayerProgression(this.interaction.user.id, "0", "0", "0", null);
        // this.client.questDb.setSlayerQuest(this.interaction.user.id, "0", "0", "0", "0");
        // await this.interaction.reply({ ephemeral: true, content: "Done." }).catch(this.client.catchError);
        return this.end();
    }
}

module.exports = Profile;