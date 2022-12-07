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
        await this.client.playerDb.set("539842701592494111", 8, "statistics.strength");

        return this.end();
    }
}

module.exports = Profile;