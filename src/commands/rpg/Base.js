const Command = require("../../base/Command");
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
} = require("discord.js");
const Nav = require("../../base/Navigation");

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
            completedRequests: ["base"],
            authorizationBitField: 0b000,
            permissions: 0n,
        });
    }

    async run() {
        const user = this.interaction.user;
        let userId = user.id;
        if (this.interaction.type === 1) userId = this.interaction.options?.get("joueur")?.user?.id;
        else if (this.interaction.type === 2) userId = this.client.users.cache.get(this.interaction.targetId);
        userId = (await this.client.getUser(userId, user)).userId;

        const sq = await this.client.questDb.load(userId);
        console.log(sq);

        const userPDB = await this.client.playerDb.load(userId);
        const userIDB = await this.client.inventoryDb.load(userId);
        const userADB = await this.client.activityDb.load(userId);
        const userMDB = await this.client.mapDb.load(userId);

        let userstatisticsObject = {};
        for (const statKey in userPDB.statisticsLevel) {
            userstatisticsObject[statKey] = `${this.consts.emojis.rpg.statistics[statKey]} `
                + `» **${this.lang.rpgAssets.statistics[statKey]} | `
                + `\`${this.client.util.intRender(userPDB.finalstatistics[statKey])}\`**\n`
                + `*(${this.lang.strings.level} ${userPDB.statisticsLevel[statKey]}) **${userPDB.statistics[statKey]}***`;

            if (userPDB.grimBoosts[statKey][0] > 0) {
                userstatisticsObject[statKey] += ` *+ **${userPDB.grimBoosts[statKey][0]}**`
                    + ` (${userPDB.grimBoosts[statKey][1]}%)`
                    + `${this.consts.emojis.rpg.objects.enchantedGrimoire}*`;
            }
        }
        userstatisticsObject = Object.values(userstatisticsObject).join("\n");
        const userRank = "";

        let userInventoryObjects = {};

        const playerFields = [
            {
                name: `» ${this.lang.panels.player.pages["0"].embeds["0"].fields["0"].name} «`,
                value: `\u200b\n${userstatisticsObject}`,
                inline: true,
            },
            {
                name: `» ${this.lang.panels.player.pages["0"].embeds["0"].fields["1"].name} «`,
                value: `\u200b\n${userRank}`,
                inline: true,
            },
        ];
        const inventoryFields = [
            {
                name: `» ${this.lang.panels.inventory.pages["0"].embeds["0"].fields["0"].name} «`,
                value: "\u200b\ninventory",
                inline: true,
            },
        ];
        const activityFields = [
            {
                name: `» ${this.lang.panels.activity.pages["0"].embeds["0"].fields["0"].name} «`,
                value: "\u200b\nactivity",
                inline: true,
            },
        ];
        const crowFields = [
            {
                name: `» ${this.lang.panels.crow.pages["0"].embeds["0"].fields["0"].name} «`,
                value: "\u200b\ncrow",
                inline: true,
            },
        ];
        const weaponsFields = [
            {
                name: `» ${this.lang.panels.weapons.pages["0"].embeds["0"].fields["0"].name} «`,
                value: "\u200b\nweapons",
                inline: true,
            },
        ];

        const pages = {
            "playerPanel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.player.pages["0"].embeds["0"].title)
                                .setFields(playerFields),
                        ]),
                ]),
            "inventoryPanel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.inventory.pages["0"].embeds["0"].title)
                                .setFields(inventoryFields),
                        ]),
                ]),
            "activityPanel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.activity.pages["0"].embeds["0"].title)
                                .setFields(activityFields),
                        ]),
                ]),
            "crowPanel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.crow.pages["0"].embeds["0"].title)
                                .setFields(crowFields),
                        ]),
                ]),
            "weaponsPanel": new Nav.Panel()
                .setPages([
                    new Nav.Page()
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(this.lang.panels.weapons.pages["0"].embeds["0"].title)
                                .setFields(weaponsFields),
                        ]),
                ]),
        };

        const universalRows = [
            new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("playerPanel")
                        .setEmoji(this.consts.emojis.rpg.symbols.player)
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("inventoryPanel")
                        .setEmoji(this.consts.emojis.rpg.symbols.inventory)
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("activityPanel")
                        .setEmoji(this.consts.emojis.rpg.symbols.activity)
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("crowPanel")
                        .setEmoji(this.consts.emojis.rpg.symbols.crow)
                        .setStyle("Secondary"),
                    new ButtonBuilder()
                        .setCustomId("weaponsPanel")
                        .setEmoji(this.consts.emojis.rpg.symbols.weapons)
                        .setStyle("Secondary"),
                ),
            new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("leavePanel")
                        .setLabel(this.lang.rows.universal.leavePanel)
                        .setStyle("Danger"),
                ),
        ];

        const panel = await this.interaction.reply({
            embeds: pages.playerPanel.pages["0"].embeds,
            components: pages.playerPanel.components.concat(universalRows),
        }).catch(this.client.util.catchError);
        if (panel === undefined) return;
        const navigation = panel.createMessageComponentCollector({
            filter: inter => inter.user.id === this.interaction.user.id,
            time: 600_000,
            dispose: true,
        });

        let currentPanel = "playerPanel";

        navigation.on("collect", async inter => {
            if (inter.isButton()) {
                if (inter.customId.endsWith("_panel") && inter.customId !== "leavePanel") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catchError);

                    currentPanel = inter.customId;
                    const newComponents = [...pages[currentPanel].pages[0].components];
                    for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                    for (const universalRow of universalRows) newComponents.push(universalRow);

                    panel.interaction.editReply({
                        embeds: pages[currentPanel].pages[0].embeds,
                        components: newComponents,
                    }).catch(this.client.util.catchError);
                }
                else if (inter.customId === "leavePanel") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catchError);
                    navigation.stop();
                }
            }
        });

        navigation.on("end", async () => {
            panel.interaction.editReply({ embeds: panel.embeds, components: [] })
                .catch(this.client.util.catchError);
        });
    }
}

module.exports = Base;