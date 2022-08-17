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
    User,
} = require("discord.js");
const Nav = require("../../base/NavigationClasses");

class StaffPanel extends Command {
    constructor() {
        super({
            name: "profile",
            description: "Commande permettant d'afficher les informations d'un joueur.",
            descriptionLocalizations: {
                "en-US": "Command to display player informations.",
            },
            options: [
                {
                    type: 6,
                    name: "joueur",
                    nameLocalizations: {
                        "en-US": "player",
                    },
                    description: "Joueur dont vous souhaitez afficher les informations.",
                    descriptionLocalizations: {
                        "en-US": "Player whose informations you want to display.",
                    },
                    required: false,
                },
            ],
            type: [1, 2],
            dmPermission: true,
            category: "RPG",
            cooldown: 5,
            finishRequest: ["profile"],
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        let [user, cached, userId] = [this.interaction.user, true, this.interaction.user.id];
        if (this.interaction.type === 1) userId = this.interaction.options?.get("joueur")?.user?.id;
        else if (this.interaction.type === 2) userId = this.client.users.cache.get(this.interaction.targetId);
        [user, cached, userId] = await this.client.getUser(userId, user);

        const userPDB = await this.client.playerDb.get(userId);
        const userIDB = await this.client.inventoryDb.get(userId);
        const userADB = await this.client.activityDb.get(userId);
        console.log(userPDB, userIDB, userADB);

        const playerString = `__***${this.lang.strings.profile_aptitudes}:***__\n`
            + `__${this.lang.constants.aptitudes.strength}:__ **${userPDB.aptitudes.strength}** `
            + `(${this.lang.strings.level} ${userPDB.stats.strength})`;
        const inventoryString = "inventory";
        const activityString = "activity";

        const pages = {
            "player_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel(this.lang.panels.player.identifier_name)
                        .setValue("player_panel")
                        .setDescription(this.lang.panels.player.identifier_description)
                        .setEmoji("👤")
                        .identifier,
                )
                .setPages(),
        };
    }
}

module.exports = StaffPanel;