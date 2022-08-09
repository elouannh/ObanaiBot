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

        const gradesRendered = {
            "owner": "👑 Owner",
            "admin": "🚀 Administrateur",
            "tester": "⛏️ Testeur",
        };
        const renderPanel = rendered => {
            return userGrade.allGrades.includes(rendered[0]) ? `Panel **${rendered[1]}**` : `~~Panel ${rendered[1]}~~`
        };
        const userGrades = "Bienvenue sur le panel du personnel.\n\n__Vos grades:__  "
            + `${userGrade.allGrades.filter(e => e.length > 1).map(e => `**${gradesRendered[e]}**`).join(" - ")}`
            + "\n\nVous avez donc accès aux panels ci-dessous:\n"
            + `${Object.entries(gradesRendered).map(e => `• ${renderPanel(e)}`).join("\n")}\n\n`
            + "*Ce panel de navigation restera actif **2 minutes** "
            + "et se désactivera au bout de **30 secondes** d'inactivité.*";

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
                                .setDescription(userGrades),
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
                                .setLabel("Changement de statut")
                                .setValue("admin_status_change")
                                .setDescription("Panel administrateur pour changer le statut du bot."),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("🚀 | Panel Administrateur - Changer de statut")
                                .setDescription("Interagissez avec les boutons ci-dessous.\n\u200B")
                                .setFields([
                                    { name: "» 📝 «", value: "Voir le statut actuel", inline: true },
                                    { name: "» 🟢 «", value: "Passer en ligne", inline: true },
                                    { name: "» 🟡 «", value: "Passer en maintenance", inline: true },
                                    { name: "» 🔴 «", value: "Passer en désactivé", inline: true },
                                ]),
                        ])
                        .setComponents([
                            new ActionRowBuilder()
                                .setComponents(
                                    new ButtonBuilder()
                                        .setEmoji("📝")
                                        .setCustomId("view_status")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji("🟢")
                                        .setCustomId("set_online")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji("🟡")
                                        .setCustomId("set_maintenance")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji("🔴")
                                        .setCustomId("set_disabled")
                                        .setStyle("Secondary"),
                                ),
                        ]),
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
                                .setDescription("Interagissez avec les boutons ci-dessous.\n\u200B")
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
                                .setDescription("Interagissez avec les boutons ci-dessous.\n\u200B")
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
                                        label: "Changement de statut",
                                        value: "admin_status_change",
                                        description: "Panel administrateur pour changer le statut du bot.",
                                    },
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
            "owner_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel("Panel Owner")
                        .setValue("owner_panel")
                        .setDescription("Panel contenant des fonctions uniques pour l'owner du bot.")
                        .setEmoji("👑")
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel("Exécution de code")
                                .setValue("owner_code_execute")
                                .setDescription("Panel pour exécuter du code depuis Discord."),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("👑 | Panel Owner - Exécution de code")
                                .setDescription("Interagissez avec les boutons ci-dessous.\n\u200B")
                                .setFields([
                                    { name: "» 📡 «", value: "Exécuter du code", inline: true },
                                ]),
                        ])
                        .setComponents([
                            new ActionRowBuilder()
                                .setComponents(
                                    new ButtonBuilder()
                                        .setEmoji("📡")
                                        .setCustomId("code_execute")
                                        .setStyle("Secondary"),
                                ),
                        ]),
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
        if (panel === undefined) return;
        const navigation = panel.createMessageComponentCollector({
            filter: inter => inter.user.id === this.interaction.user.id,
            time: 120_000,
            idle: 30_000,
            dispose: true,
        });

        let currentPanel = "tester_panel";

        navigation.on("collect", async inter => {
            if (inter.isSelectMenu()) {
                await inter.deferUpdate()
                    .catch(console.error);
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
                        }).catch(console.error);
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
                const guilds = await this.client.internalServerManager.guilds();
                const tempoStatus = [
                    this.client.statusDb.datas.mode,
                    await this.client.internalServerManager.status(this.interaction),
                ];
                if (inter.customId === "leave_panel") {
                    await inter.deferUpdate()
                        .catch(console.error);
                    navigation.stop();
                }
                else if (inter.customId === "view_status") {
                    await inter.deferUpdate()
                        .catch(console.error);
                    inter.followUp({
                        content: `Statut actuel du bot: **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}`,
                        ephemeral: true,
                    }).catch(console.error);
                }
                else if (inter.customId === "set_online") {
                    await inter.deferUpdate()
                        .catch(console.error);
                    if (tempoStatus[0] === "online") {
                        inter.followUp({
                            content: `⚠️ Le bot est déjà en **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}.`,
                            ephemeral: true,
                        }).catch(console.error);
                    }
                    else {
                        this.client.statusDb.setOnline();
                        inter.followUp({
                            content: "✅ Le bot est désormais en **online** 🟢.",
                            ephemeral: true,
                        }).catch(console.error);
                    }
                }
                else if (inter.customId === "set_maintenance") {
                    await inter.deferUpdate()
                        .catch(console.error);
                    if (tempoStatus[0] === "maintenance") {
                        inter.followUp({
                            content: `⚠️ Le bot est déjà en **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}.`,
                            ephemeral: true,
                        }).catch(console.error);
                    }
                    else {
                        this.client.statusDb.setMaintenance();
                        inter.followUp({
                            content: "✅ Le bot est désormais en **maintenance** 🟡.",
                            ephemeral: true,
                        }).catch(console.error);
                    }
                }
                else if (inter.customId === "set_disabled") {
                    await inter.deferUpdate()
                        .catch(console.error);
                    if (tempoStatus[0] === "disabled") {
                        inter.followUp({
                            content: `⚠️ Le bot est déjà en **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}.`,
                            ephemeral: true,
                        }).catch(console.error);
                    }
                    else {
                        this.client.statusDb.setDisabled();
                        inter.followUp({
                            content: "✅ Le bot est désormais en **disabled** 🔴.",
                            ephemeral: true,
                        }).catch(console.error);
                    }
                }
                else if (inter.customId === "guilds_list") {
                    await inter.deferUpdate()
                        .catch(console.error);
                    const posted = await this.client.pasteGGManager.postGuildsList(this.client.guilds.cache);

                    if (posted.status === "success") {
                        const authGuilds = "**» Serveurs autorisés**:\n"
                            + `${guilds.cached.map(e => `${e}`).join(" / ")}`;
                        inter.followUp({
                            content: "`(Expire dans 24h)`"
                                + " La liste des serveurs a été générées sur ce lien **Paste.gg** :"
                                + `\n\n**• [${posted.result.id}](${posted.result.url})**\n\n`
                                + `${authGuilds}`,
                            ephemeral: true,
                        }).catch(console.error);
                    }
                    else if (posted.status === "error") {
                        inter.followUp({
                            content: ":warning: Une erreur est survenue lors de la génération de la liste des serveurs.",
                            ephemeral: true,
                        }).catch(console.error);
                    }
                }
                else if (inter.customId === "vip_list") {
                    await inter.deferUpdate()
                        .catch(console.error);
                    const players = await this.client.externalServerDb.players();
                    const playersInfos = "**» Joueurs VIPs**:\n"
                        + `${players.cache.vips.map(p => inlineCode(p)).join(" / ")}\n\n`
                        + "**» Joueurs VIP(+)**:\n"
                        + `${players.cache.vipplus.map(p => inlineCode(p)).join(" / ")}`;
                    inter.followUp({
                        content: `${playersInfos}`,
                        ephemeral: true,
                    }).catch(console.error);
                }
                else if (["add_auth_guilds", "remove_auth_guilds", "add_vip", "remove_vip"].includes(inter.customId)) {
                    let modalResponse = undefined;
                    if (inter.customId === "add_auth_guilds") {
                        const modal = new ModalBuilder()
                            .setTitle("Ajouter des serveurs autorisés")
                            .setCustomId("modal_add_auth_guilds")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel("Entrez l'identifiant:")
                                        .setCustomId("guild_added")
                                        .setPlaceholder("ID")
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(console.error);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(console.error);
                    }
                    else if (inter.customId === "remove_auth_guilds") {
                        const modal = new ModalBuilder()
                            .setTitle("Retirer des serveurs autorisés")
                            .setCustomId("modal_remove_auth_guilds")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel("Entrez l'identifiant:")
                                        .setCustomId("guild_removed")
                                        .setPlaceholder("ID")
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(console.error);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(console.error);
                    }
                    else if (inter.customId === "add_vip") {
                        const modal = new ModalBuilder()
                            .setTitle("Ajouter des VIPs/VIPs(+)")
                            .setCustomId("modal_add_vip")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel("(VIP) Entrez l'identifiant:")
                                        .setCustomId("vip_added")
                                        .setPlaceholder("ID")
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short),
                                ),
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel("(VIP+) Entrez l'identifiant:")
                                        .setCustomId("vipplus_added")
                                        .setPlaceholder("ID")
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(console.error);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(console.error);
                    }
                    else if (inter.customId === "remove_vip") {
                        const modal = new ModalBuilder()
                            .setTitle("Retirer des VIPs/VIPs(+)")
                            .setCustomId("modal_remove_vip")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel("(VIP) Entrez l'identifiant:")
                                        .setCustomId("vip_removed")
                                        .setPlaceholder("ID")
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short),
                                ),
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel("(VIP+) Entrez l'identifiant:")
                                        .setCustomId("vipplus_removed")
                                        .setPlaceholder("ID")
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(console.error);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(console.error);
                    }

                    if (modalResponse !== undefined) {
                        if (modalResponse.customId === "modal_add_auth_guilds") {
                            const guildIDField = modalResponse.fields.getTextInputValue("guild_added") ?? "null";

                            if (guilds.list.includes(guildIDField)) {
                                modalResponse.reply({
                                    content: `⚠️ Le serveur \`${guildIDField}\` est **déjà autorisé**.`,
                                    ephemeral: true,
                                }).catch(console.error);
                            }
                            else {
                                modalResponse.reply({
                                    content: `✅ Le serveur \`${guildIDField}\` est **désormais autorisé**.`,
                                    ephemeral: true,
                                }).catch(console.error);
                                this.client.internalServerManager.db.push("internalServer", guildIDField, "authServers");
                            }
                        }
                        else if (modalResponse.customId === "modal_remove_auth_guilds") {
                            const guildIDField = modalResponse.fields.getTextInputValue("guild_removed") ?? "null";

                            if (!guilds.list.includes(guildIDField)) {
                                modalResponse.reply({
                                    content: `⚠️ Le serveur \`${guildIDField}\` n'est actuellement **pas autorisé**.`,
                                    ephemeral: true,
                                }).catch(console.error);
                            }
                            else {
                                modalResponse.reply({
                                    content: `✅ Le serveur \`${guildIDField}\` n'est **désormais plus autorisé**.`,
                                    ephemeral: true,
                                }).catch(console.error);
                                this.client.internalServerManager.db.set(
                                    "internalServer",
                                    this.client.internalServerManager.datas.authServers.filter(s => s !== guildIDField),
                                    "authServers",
                                );
                            }
                        }
                        else if (modalResponse.customId === "modal_add_vip") {
                            const [vip, vipplus] = [
                                modalResponse.fields.getTextInputValue("vip_added") ?? "",
                                modalResponse.fields.getTextInputValue("vipplus_added") ?? "",
                            ];

                            let message = "";

                            if (vip.length > 2) {
                                const playerDatas = await this.client.externalServerDb.get(vip);
                                if (playerDatas.grades.includes("vip")) {
                                    message += "⚠️Le joueur "
                                        + `\`${escapeMarkdown(this.client.users.cache.get(vip)?.username ?? vip)}\``
                                        + " est déjà **VIP** sur le bot.";
                                }
                                else {
                                    message += "✅ Le joueur "
                                        + `\`${escapeMarkdown(this.client.users.cache.get(vip)?.username ?? vip)}\``
                                        + " est désormais **VIP** sur le bot.";
                                    this.client.externalServerDb.db.push(vip, "vip", "grades");
                                }
                            }
                            if (vipplus.length > 2) {
                                const playerDatas = await this.client.externalServerDb.get(vipplus);
                                if (message.length > 4) message += "\n\n";
                                if (playerDatas.grades.includes("vip+")) {
                                    message += "⚠️Le joueur "
                                        + `\`${escapeMarkdown(
                                            this.client.users.cache.get(vipplus)?.username ?? vipplus,
                                        )}\``
                                        + " est déjà **VIP(+)** sur le bot.";
                                }
                                else {
                                    message += "✅ Le joueur "
                                        + `\`${escapeMarkdown(
                                            this.client.users.cache.get(vipplus)?.username ?? vipplus,
                                        )}\``
                                        + " est désormais **VIP(+)** sur le bot.";
                                    this.client.externalServerDb.db.push(vipplus, "vip+", "grades");
                                }
                            }

                            if (message.length > 10) {
                                modalResponse.reply({
                                    content: message,
                                    ephemeral: true,
                                }).catch(console.error);
                            }
                        }
                        else if (modalResponse.customId === "modal_remove_vip") {
                            const [vip, vipplus] = [
                                modalResponse.fields.getTextInputValue("vip_removed") ?? "",
                                modalResponse.fields.getTextInputValue("vipplus_removed") ?? "",
                            ];

                            let message = "";

                            if (vip.length > 2) {
                                const playerDatas = await this.client.externalServerDb.get(vip);
                                if (!playerDatas.grades.includes("vip")) {
                                    message += "⚠️Le joueur "
                                        + `\`${escapeMarkdown(this.client.users.cache.get(vip)?.username ?? vip)}\``
                                        + " n'est pas **VIP** sur le bot.";
                                }
                                else {
                                    message += "✅ Le joueur "
                                        + `\`${escapeMarkdown(this.client.users.cache.get(vip)?.username ?? vip)}\``
                                        + " n'est désormais plus **VIP** sur le bot.";
                                    this.client.externalServerDb.db.set(
                                        vip,
                                        playerDatas.grades.filter(g => g !== "vip"),
                                        "grades",
                                    );
                                }
                            }
                            if (vipplus.length > 2) {
                                const playerDatas = await this.client.externalServerDb.get(vipplus);
                                if (message.length > 4) message += "\n\n";
                                if (!playerDatas.grades.includes("vip+")) {
                                    message += "⚠️Le joueur "
                                        + `\`${escapeMarkdown(
                                            this.client.users.cache.get(vipplus)?.username ?? vipplus,
                                        )}\``
                                        + " n'est pas **VIP(+)** sur le bot.";
                                }
                                else {
                                    message += "✅ Le joueur "
                                        + `\`${escapeMarkdown(
                                            this.client.users.cache.get(vipplus)?.username ?? vipplus,
                                        )}\``
                                        + " n'est désormais plus **VIP(+)** sur le bot.";
                                    this.client.externalServerDb.db.push(vipplus, "vip+", "grades");
                                }
                            }

                            if (message.length > 10) {
                                modalResponse.reply({
                                    content: message,
                                    ephemeral: true,
                                }).catch(console.error);
                            }
                        }
                    }
                }
                else if (inter.customId === "code_execute") {
                    const modal = new ModalBuilder()
                        .setTitle("Exécuter du code")
                        .setCustomId("modal_code_execute")
                        .setComponents(
                            new ActionRowBuilder().setComponents(
                                new TextInputBuilder()
                                    .setLabel("Code (JavaScript):")
                                    .setCustomId("code_input")
                                    .setPlaceholder("console.log(\"Hello world\");")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Paragraph),
                            ),
                        );

                    await inter.showModal(modal).catch(console.error);
                    const modalSubmit = await inter.awaitModalSubmit({
                        filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                        time: 60_000,
                    }).catch(console.error);

                    if (modalSubmit !== undefined) {
                        const codeInput = modalSubmit.fields.getTextInputValue("code_input") ?? "";

                        const resp = await this.client.util.eval(codeInput);
                        modalSubmit.reply({
                            content: resp,
                            ephemeral: false,
                        }).catch(console.error);
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