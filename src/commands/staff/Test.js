const Command = require("../../base/Command");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");

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
            cooldown: 10,
            completedRequests: ["test", "adventure"],
            authorizationBitField: 0b000,
            permissions: 0n,
        });
    }

    async run() {
        this.client.inventoryDb.set(this.interaction.user.id, 5, "items.materials.wood");
        this.client.questDb.updateSlayerProgression(this.interaction.user.id, "0", "0", "0", null);
        this.client.questDb.setSlayerQuest(this.interaction.user.id, "0", "0", "0", "0");
        await this.interaction.reply({ ephemeral: true, content: "Done." }).catch(this.client.catchError);

        return this.end();
    }
}

module.exports = Profile;