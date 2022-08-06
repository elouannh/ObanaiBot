const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, Status, ButtonBuilder, escapeMarkdown } = require("discord.js");
const PasteGG = require("../../base/PasteGGClasses");

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
        console.log(await this.client.pasteGGManager.postGuildsList(this.client.guilds.cache));
    }
}

module.exports = Testing;