const Command = require("../../base/Command");
const {
    EmbedBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
    ButtonBuilder,
    inlineCode,
    ModalBuilder,
    TextInputStyle,
    TextInputBuilder,
    escapeMarkdown,
} = require("discord.js");
const Nav = require("../../base/NavigationClasses");

class StaffPanel extends Command {
    constructor() {
        super({
            name: "profile",
            description: "Command to display player informations.",
            descriptionLocalizations: {
                "fr": "Commande permettant d'afficher les informations d'un joueur.",
            },
            type: 1,
            dmPermission: true,
            category: "RPG",
            cooldown: 5,
            finishRequest: ["profile"],
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        let pages = {
            "user_select": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel()
                )
        };

    }
}

module.exports = StaffPanel;