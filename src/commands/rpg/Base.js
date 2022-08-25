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
const calcPlayerLevel = require("../../elements/calcPlayerLevel");

class Base extends Command {
    constructor() {
        super({
            name: "base",
            description: "Commande permettant d'afficher les informations d'un joueur.",
            descriptionLocalizations: {
                "en-US": "Command to display player informations.",
            },
            options: [
                {
                    type: 6,
                    name: "base",
                    nameLocalizations: {
                        "en-US": "base",
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
            finishRequest: ["base"],
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        let [user, cached, userId] = [this.interaction.user, true, this.interaction.user.id];
        if (this.interaction.type === 1) userId = this.interaction.options?.get("joueur")?.user?.id;
        else if (this.interaction.type === 2) userId = this.client.users.cache.get(this.interaction.targetId);
        [user, cached, userId] = await this.client.getUser(userId, user);

        const userPDB = await this.client.playerDb.load(userId);
        const userIDB = await this.client.inventoryDb.get(userId);
        const userADB = await this.client.activityDb.get(userId);

        console.log(userPDB);

        const userStatsObject = {};

        for (const statKey in userPDB.statsLevel) {
            if (typeof userStatsObject[statKey] !== "string") {
                userStatsObject[statKey] = `${this.consts.emojis.rpg.stats[statKey]} `
                    + `» **${this.lang.constants.aptitudes[statKey]} | `
                    + `\`${this.client.util.intRender(userPDB.finalStats[statKey])}\`**\n`
                    + `*(${this.lang.strings.level} ${userPDB.statsLevel[statKey]}) **${userPDB.stats[statKey]}***`;

                if (userPDB.grimBoosts[statKey][0] > 0) {
                    userStatsObject[statKey] += ` *+ **${userPDB.grimBoosts[statKey][0]}**`
                        + ` (${userPDB.grimBoosts[statKey][1]}%)`
                        + `${this.consts.emojis.rpg.objects.enchantedGrimoire}*`;
                }

                if (statKey in userPDB.catBoosts) {
                    if (userPDB.catBoosts[statKey][0] > 0) {
                        userStatsObject[statKey] += ` *+ **${userPDB.catBoosts[statKey][0]}**`
                            + ` (${userPDB.catBoosts[statKey][1]}%)`
                            + `${this.consts.emojis.rpg.symbols.category}*`;
                    }
                    else {
                        userStatsObject[statKey] += ` *- **${this.client.util.positivize(userPDB.catBoosts[statKey][0])}**`
                            + ` (${userPDB.catBoosts[statKey][1]}%)`
                            + `${this.consts.emojis.rpg.symbols.category}*`;
                    }
                }
            }
        }

        const userRank = `Niveau: **${userPDB.level.level}** | Exp total: ⭐ **${this.client.util.intRender(userPDB.exp, " ")}**`
            + `\nExp du niveau: ⭐ **${
                this.client.util.intRender(userPDB.level.tempExp, " ")}**/${this.client.util.intRender(userPDB.level.required, " ")
            }`;

        const playerFields = [
            {
                name: `» ${this.lang.panels.player.pages["0"].embeds["0"].fields["0"].name} «`,
                value: `\u200b\n${Object.values(userStatsObject).join("\n")}`,
                inline: true,
            },
            {
                name: `» ${this.lang.panels.player.pages["0"].embeds["0"].fields["1"].name} «`,
                value: `\u200b\n${userRank}`,
                inline: true,
            },
        ];
        const inventoryString = "inventory";
        const activityString = "activity";
        const badgesString = "badges";
        const crowString = "crow";
        const weaponsString = "weapons";

        const pages = {
            "player_panel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.player.pages["0"].embeds["0"].title)
                                .setFields(playerFields),
                        ]),
                ]),
            "inventory_panel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.inventory.pages["0"].embeds["0"].title)
                                .setDescription(inventoryString),
                        ]),
                ]),
            "activity_panel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.activity.pages["0"].embeds["0"].title)
                                .setDescription(activityString),
                        ]),
                ]),
            "badges_panel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.badges.pages["0"].embeds["0"].title)
                                .setDescription(badgesString),
                        ]),
                ]),
            "crow_panel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.crow.pages["0"].embeds["0"].title)
                                .setDescription(crowString),
                        ]),
                ]),
            "weapons_panel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.weapons.pages["0"].embeds["0"].title)
                                .setDescription(weaponsString),
                        ]),
                ]),
        };

        const universalRows = [
            new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("player_panel")
                        .setLabel(this.lang.rows.universal.player_panel)
                        .setEmoji(this.consts.emojis.rpg.symbols.player)
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("inventory_panel")
                        .setLabel(this.lang.rows.universal.inventory_panel)
                        .setEmoji(this.consts.emojis.rpg.symbols.inventory)
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("activity_panel")
                        .setLabel(this.lang.rows.universal.activity_panel)
                        .setEmoji(this.consts.emojis.rpg.symbols.activity)
                        .setStyle("Secondary"),
                ),
            new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("badges_panel")
                        .setLabel(this.lang.rows.universal.badges_panel)
                        .setEmoji(this.consts.emojis.rpg.symbols.badges)
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("crow_panel")
                        .setLabel(this.lang.rows.universal.crow_panel)
                        .setEmoji(this.consts.emojis.rpg.symbols.crow)
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("weapons_panel")
                        .setLabel(this.lang.rows.universal.weapons_panel)
                        .setEmoji(this.consts.emojis.rpg.symbols.weapons)
                        .setStyle("Secondary"),
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
                if (inter.customId.endsWith("_panel") && inter.customId !== "leave_panel") {
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
                else if (inter.customId === "leave_panel") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catcherror);
                    navigation.stop();
                }
            }
        });

        navigation.on("end", async () => {
            panel.interaction.editReply({ embeds: panel.embeds, components: [] })
                .catch(this.client.util.catcherror);
        });
    }
}

module.exports = Base;