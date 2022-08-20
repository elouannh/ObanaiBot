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

        let userPDB = await this.client.playerDb.load(userId);
        console.log(userPDB);

        userPDB = await this.client.playerDb.get(userId);
        const userIDB = await this.client.inventoryDb.get(userId);
        const userADB = await this.client.activityDb.get(userId);

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
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.lang.panels.player.pages["0"].label)
                                .setValue("player_main")
                                .setDescription(this.lang.panels.player.pages["0"].description)
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.player.pages["0"].embeds["0"].title)
                                .setDescription(playerString),
                        ]),
                ]),
            "inventory_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel(this.lang.panels.inventory.identifier_name)
                        .setValue("inventory_panel")
                        .setDescription(this.lang.panels.inventory.identifier_description)
                        .setEmoji("🎒")
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.lang.panels.inventory.pages["0"].label)
                                .setValue("inventory_main")
                                .setDescription(this.lang.panels.inventory.pages["0"].description)
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.inventory.pages["0"].embeds["0"].title)
                                .setDescription(inventoryString),
                        ]),
                ]),
            "activity_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel(this.lang.panels.activity.identifier_name)
                        .setValue("activity_panel")
                        .setDescription(this.lang.panels.activity.identifier_description)
                        .setEmoji("📺")
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.lang.panels.activity.pages["0"].label)
                                .setValue("activity_main")
                                .setDescription(this.lang.panels.activity.pages["0"].description)
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.activity.pages["0"].embeds["0"].title)
                                .setDescription(activityString),
                        ]),
                ]),
        };

        const universalRows = [
            new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("player_panel")
                        .setLabel(this.lang.rows.universal.player_panel)
                        .setStyle("Primary"),
                    new ButtonBuilder()
                        .setCustomId("inventory_panel")
                        .setLabel(this.lang.rows.universal.inventory_panel)
                        .setStyle("Primary"),
                    new ButtonBuilder()
                        .setCustomId("activity_panel")
                        .setLabel(this.lang.rows.universal.activity_panel)
                        .setStyle("Primary"),
                ),
            new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("leave_panel")
                        .setLabel(this.lang.rows.universal.leave_panel)
                        .setStyle("Danger"),
                ),
        ];

        const panel = await this.interaction.reply({
            embeds: pages.player_panel.pages["0"].embeds,
            components: pages.player_panel.components.concat(universalRows),
        }).catch(this.client.util.catcherror);
        if (panel === undefined) return;
        const navigation = panel.createMessageComponentCollector({
            filter: inter => inter.user.id === this.interaction.user.id,
            time: 600_000,
            dispose: true,
        });

        let currentPanel = "player_panel";

        navigation.on("collect", async inter => {
            if (inter.isButton()) {
                if (inter.customId.endsWith("_panel")) {
                    await inter.deferUpdate()
                        .catch(this.client.util.catcherror);

                    currentPanel = inter.customId;
                    const newComponents = [...pages[currentPanel].pages[0].components];
                    for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                    for (const universalRow of universalRows) newComponents.push(universalRow);

                    panel.interaction.editReply({
                        embeds: pages[currentPanel].pages[0].embeds,
                        components: newComponents,
                    }).catch(this.client.util.catcherror);
                }
            }
        });

        navigation.on("end", async () => {
            panel.interaction.editReply({ embeds: panel.embeds, components: [] })
                .catch(this.client.util.catcherror);
        });
    }
}

module.exports = StaffPanel;