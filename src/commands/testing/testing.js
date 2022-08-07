const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, inlineCode } = require("discord.js");
const Nav = require("../../base/NavigationClasses");

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
        const userGrade = this.client.internalServerManager.userRank(this.interaction.user.id);
        const status = await this.client.internalServerManager.status(this.interaction);
        const infos = await this.client.statusDb.infos();
        const players = await this.client.externalServerDb.players();

        const botStatus = `» Ping API: **${status.apiPing}**\n`
            + `» Ping Serveur: **${status.serverPing}**\n\n`
            + `» Serveur Interne 1: **${status.server1.status}** | **${status.server1.processus}**\n`
            + `» Serveur Interne 2: **${status.server2.status}** | **${status.server2.processus}**\n`
            + `» Statut du RPG: **${status.clientStatus}**\n\n`
            + `» Mémoire **(${status.memoryPercent})**: **${status.memoryUsage[0]}**/${status.memoryUsage[1]}\n`
            + `» Capacité **(${status.requestsPercent})**: **${status.requests[0]}**/${status.requests[1]}\n`
            + `» En ligne depuis: **${status.uptime}**`;

        const botInfos = `» Serveurs: **${infos.guilds}**\n`
            + `» Total de membres: **${infos.totalMembers}**\n`
            + `» Utilisateurs dans le cache: **${infos.users}**\n`
            + `» Joueurs: **${infos.players.ensured}** | **${infos.players.started}** ayant commencé leur aventure.\n`
            + `» Version: **${this.client.version}**`;

        const playersInfos = "**- Joueurs VIPs**:\n"
            + `${players.cache.vips.map(p => inlineCode(p)).join(" / ")}\n\n`
            + "**- Joueurs VIP(+)**\n"
            + `${players.cache.vipplus.map(p => inlineCode(p)).join(" / ")}`;

        const pages = {
            "tester_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel("Panel Testeur")
                        .setValue("tester_panel")
                        .setDescription("Panel contenant des informations utiles sur le bot.")
                        .setEmoji("⛏️")
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel("Informations utilisateur")
                                .setValue("user_informations")
                                .setDescription("Informations relatives à l'utilisateur faisant la commande.")
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("⛏️ | Panel Testeur - Informations utilisateur")
                                .setDescription(`**Grades:** ${userGrade.allGrades.filter(g => g.length > 1).join(", ")}`),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel("Statut du bot")
                                .setValue("bot_status")
                                .setDescription("Statut du bot ainsi que les processus en cours.")
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("⛏️ | Panel Testeur - Statut du bot")
                                .setDescription(`${botStatus}`),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel("Informations du bot")
                                .setValue("bot_infos")
                                .setDescription("Informations du bot ainsi que certaines données.")
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("⛏️ | Panel Testeur - Informations du bot")
                                .setDescription(`${botInfos}`),
                        ]),
                ])
                .setComponents([
                    new ActionRowBuilder()
                        .setComponents(
                            new SelectMenuBuilder()
                                .setCustomId("tester_panel")
                                .setPlaceholder("Page...")
                                .setOptions([
                                    {
                                        value: "user_informations",
                                        label: "Informations utilisateur",
                                        description: "Informations relatives à l'utilisateur faisant la commande.",
                                    },
                                    {
                                        value: "bot_status",
                                        label: "Statut du bot",
                                        description: "Statut du bot ainsi que les processus en cours.",
                                    },
                                    {
                                        value: "bot_infos",
                                        label: "Informations du bot",
                                        description: "Informations du bot ainsi que certaines données.",
                                    },
                                ]),
                        ),
                ]),
            "admin_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel("Panel Administrateur")
                        .setValue("admin_panel")
                        .setDescription("Panel contenant des fonctions administratives.")
                        .setEmoji("🚀")
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel("Serveurs")
                                .setValue("admin_guilds")
                                .setDescription("Panel administrateur pour gérer les serveurs."),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("🚀 | Panel Administrateur - Serveurs")
                                .setDescription("Intéragissez avec les boutons ci-dessous.\n\u200B")
                                .setFields([
                                    { name: "» 👥 «", value: "Voir la liste des serveurs", inline: true },
                                    { name: "» 🔓 «", value: "Ajoute des serveurs autorisés (- de 30 membres)", inline: true },
                                    { name: "» 🔒 «", value: "Supprimer des serveurs autorisés (+ de 30 membres)", inline: true },
                                ]),
                        ])
                        .setComponents([
                            new ActionRowBuilder()
                                .setComponents(
                                    new ButtonBuilder()
                                        .setEmoji("👥")
                                        .setCustomId("guilds_list")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji("🔓")
                                        .setCustomId("add_auth_guilds")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji("🔒")
                                        .setCustomId("remove_auth_guilds")
                                        .setStyle("Secondary"),
                                ),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel("VIPs/VIPs(+)")
                                .setValue("admin_vip")
                                .setDescription("Panel administrateur pour gérer les VIPs et les VIPs(+)."),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("🚀 | Panel Administrateur - VIPs/VIPs(+)")
                                .setDescription("Intéragissez avec les boutons ci-dessous.\n\u200B")
                                .setFields([
                                    { name: "» 💎 «", value: "Voir la liste des VIPs/VIPs(+)", inline: true },
                                    { name: "» 🪄 «", value: "Ajouter des VIPs/VIPs(+)", inline: true },
                                    { name: "» 🧲 «", value: "Supprimer des VIPs/VIPs(+)", inline: true },
                                ]),
                        ])
                        .setComponents([
                            new ActionRowBuilder()
                                .setComponents(
                                    new ButtonBuilder()
                                        .setEmoji("💎")
                                        .setCustomId("vip_list")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji("🪄")
                                        .setCustomId("add_vip")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji("🧲")
                                        .setCustomId("remove_vip")
                                        .setStyle("Secondary"),
                                ),
                        ]),
                ])
                .setComponents([
                    new ActionRowBuilder()
                        .setComponents(
                            new SelectMenuBuilder()
                                .setCustomId("admin_panel")
                                .setPlaceholder("Page...")
                                .setOptions([
                                    {
                                        value: "admin_guilds",
                                        label: "Serveurs",
                                        description: "Panel administrateur pour gérer les serveurs.",
                                    },
                                    {
                                        value: "admin_vip",
                                        label: "VIPs/VIPs(+)",
                                        description: "Panel administrateur pour gérer les VIPs et les VIPs(+).",
                                    },
                                ]),
                        ),
                ]),
        };

        const universalRows = [
                new ActionRowBuilder()
                    .setComponents(
                        new SelectMenuBuilder()
                            .setCustomId("panel_category_selector")
                            .setPlaceholder("Panel...")
                            .setOptions(Object.values(pages).map(option => option.identifier)),
                    ),
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder()
                            .setCustomId("leave_panel")
                            .setLabel("Quitter le panel")
                            .setStyle("Danger"),
                    ),
        ];

        const panel = await this.interaction.reply({
            embeds: pages.tester_panel.pages[0].embeds,
            components: pages.tester_panel.components.concat(universalRows),
        }).catch(console.error);
        const navigation = panel.createMessageComponentCollector({
            filter: inter => inter.user.id === this.interaction.user.id,
            time: 120_000,
            idle: 30_000,
            dispose: true,
        });

        let currentPanel = "tester_panel";

        navigation.on("collect", async inter => {
            await inter.deferUpdate()
                .catch(console.error);
            if (inter.isSelectMenu()) {
                if (inter.customId === "panel_category_selector") {
                    if (userGrade.asMinimal(userGrade.allGrades).includes(inter.values[0].split("_")[0])) {
                        currentPanel = inter.values[0];
                        const newComponents = [...pages[currentPanel].pages[0].components];
                        for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                        for (const universalRow of universalRows) newComponents.push(universalRow);

                        panel.interaction.editReply({
                            embeds: pages[currentPanel].pages[0].embeds,
                            components: newComponents,
                        }).catch(console.error);
                    }
                    else {
                        inter.followUp({
                            content: ":warning: Il semblerait que vous n'ayez pas les permissions nécessaires pour accéder à cette page.",
                            ephemeral: true,
                        });
                    }
                }
                else if (Object.keys(pages).includes(inter.customId)) {
                    const newComponents = [...pages[currentPanel].pages.find(p => p.identifier.value === inter.values[0]).components];
                    for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                    for (const universalRow of universalRows) newComponents.push(universalRow);

                    panel.interaction.editReply({
                        embeds: pages[currentPanel].pages.find(p => p.identifier.value === inter.values[0]).embeds,
                        components: newComponents,
                    }).catch(console.error);
                }
            }
            else if (inter.isButton()) {
                if (inter.customId === "leave_panel") {
                    await inter.deferUpdate()
                        .catch(console.error);
                    navigation.stop();
                }
                else if (inter.customId === "guilds_list") {
                    const posted = await this.client.pasteGGManager.postGuildsList(this.client.guilds.cache);

                    if (posted.status === "success") {
                        inter.followUp({
                            content: "`(Expire dans 24h)` La liste des serveurs a été générées sur ce lien **Paste.gg** :"
                                + `\n\n**• [${posted.result.id}](${posted.result.url})**`,
                            ephemeral: true,
                        });
                    }
                    else if (posted.status === "error") {
                        inter.followUp({
                            content: ":warning: Une erreur est survenue lors de la génération de la liste des serveurs.",
                            ephemeral: true,
                        });
                    }
                }
            }
        });

        navigation.on("end", async () => {
            panel.interaction.editReply({ embeds: panel.embeds, components: [] })
                .catch(console.error);
        });
    }
}

module.exports = Testing;