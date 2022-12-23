const Command = require("../../base/Command");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require("discord.js");

class Profile extends Command {
    constructor() {
        super({
            name: "test",
            description: "Commande permettant de tester un cooldown.",
            descriptionLocalizations: {
                "en-US": "Command to test a cooldown.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "Staff",
            cooldown: 0,
            completedRequests: ["test"],
            authorizationBitField: 0b100,
            permissions: 0n,
        });
    }

    async run() {
        await this.client.questDb.skipSlayerQuest(this.interaction.user.id);
        await this.interaction.reply({ ephemeral: true, content: "Done." }).catch(this.client.catchError);

        return this.end();
    }
}

module.exports = Profile;