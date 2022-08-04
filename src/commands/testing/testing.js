const Command = require("../../base/Command");
const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

class Testing extends Command {
    constructor() {
        super({
            category: "Testing",
            cooldown: 7,
            description: "Commande permettant de tester une fonctionnalité.",
            finishRequest: ["Testing"],
            name: "testing",
            private: "testers",
            permissions: 0n,
        });
    }

    async run() {
        await this.interaction.reply("test slash command réussi");
    }
}

module.exports = Testing;