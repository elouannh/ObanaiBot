const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, Status, ButtonBuilder, escapeMarkdown } = require("discord.js");
const PasteGG = require("../../base/PasteGGManager");

class Testing extends Command {
    constructor() {
        super({
            category: "Testing",
            cooldown: 7,
            description: "Commande permettant de tester une fonctionnalité.",
            finishRequest: ["Testing"],
            name: "testing2",
            private: "testing",
            permissions: 0n,
        });
    }

    async run() {
    }
}

module.exports = Testing;