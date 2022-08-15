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
        const user_select = await this.interaction.reply({
            content: `**${this.language.strings.user_select_message}**\n\u200b`,
            components: [
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder()
                            .setLabel(this.language.rows.buttons.select_author.label)
                            .setCustomId("select_author")
                            .setStyle("Primary"),
                        new ButtonBuilder()
                            .setLabel(this.language.rows.buttons.select_custom.label)
                            .setCustomId("select_custom")
                            .setStyle("Primary"),
                        new ButtonBuilder()
                            .setLabel(this.language.rows.buttons.cancel_select.label)
                            .setCustomId("cancel_select")
                            .setStyle("Danger"),
                    ),
            ],
        });

    }
}

module.exports = StaffPanel;