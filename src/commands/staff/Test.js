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
            authorizationBitField: 0b000,
            permissions: 0n,
        });
    }

    async run() {
        await this.client.playerDb.set("539842701592494111", 8, "statistics.strength");
        await this.client.playerDb.set("539842701592494111", 7, "statistics.defense");
        await this.client.util.delay(10_000);
        console.log(this.client.questDb.get("539842701592494111").currentQuests);


        return this.end();
    }
}

module.exports = Profile;