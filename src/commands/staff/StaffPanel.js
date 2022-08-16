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
            name: "staff-panel",
            description: "Commande permettant d'afficher le panel pour le personnel du bot.",
            descriptionLocalizations: {
                "en-US": "Command to display the staff panel.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "Staff",
            cooldown: 10,
            finishRequest: ["staff-panel"],
            private: "testers",
            permissions: 0n,
        });
    }

    async run() {
        const userGrade = this.client.internalServerManager.userRank(this.interaction.user.id);
        const status = await this.client.internalServerManager.status(this.interaction);
        const infos = await this.client.statusDb.infos();

        const renderPanel = rendered => {
            return userGrade.allGrades.includes(rendered[0].split("_")[0]) ? `**${rendered[1]}**` : `~~${rendered[1]}~~`;
        };
        const userGrades = this.language.strings.home_title
            + `\n\n__${this.language.strings.your_grades}:__  `
            + userGrade.allGrades
                .filter(e => e.length > 1)
                .map(e => `**${this.language.strings[`${e}_grade`]}**`).join(" - ")
            + `\n\n${this.language.strings.panels_accesses_message}:\n`
            + `${Object.entries(this.language.strings).filter(e => e[0].endsWith("_grade")).map(e => `• ${renderPanel(e)}`).join("\n")}\n\n`
            + `*${this.language.strings.panels_timeout_message}*`;

        const botStatus = `» ${this.language.strings.api_ping}: **${status.apiPing}**\n`
            + `» ${this.language.strings.server_ping}: **${status.serverPing}**\n\n`
            + `» ${this.language.strings.internal_server_1}: **${status.server1.status}** | **${status.server1.processus}**\n`
            + `» ${this.language.strings.internal_server_2}: **${status.server2.status}** | **${status.server2.processus}**\n`
            + `» ${this.language.strings.rpg_status}: **${status.clientStatus}**\n\n`
            + `» ${this.language.strings.memory} **(${status.memoryPercent})**: **${status.memoryUsage[0]}**/${status.memoryUsage[1]}\n`
            + `» ${this.language.strings.capacity} **(${status.requestsPercent})**: **${status.requests[0]}**/${status.requests[1]}\n`
            + `» ${this.language.strings.uptime}: **${status.uptime}**`;

        const botInfos = `» ${this.language.strings.guilds}: **${infos.guilds}**\n`
            + `» ${this.language.strings.total_members}: **${infos.totalMembers}**\n`
            + `» ${this.language.strings.cached_users}: **${infos.users}**\n`
            + `» ${this.language.strings.players}: **${infos.players.ensured}** | **${infos.players.started}** ayant commencé leur aventure.\n`
            + `» ${this.language.strings.version}: **${this.client.version}**`;

        const pages = {
            "tester_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel(this.language.strings.tester_panel)
                        .setValue("tester_panel")
                        .setDescription(this.language.panels.tester.identifier_description)
                        .setEmoji("⛏️")
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.language.panels.tester.pages["0"].label)
                                .setValue("user_informations")
                                .setDescription(this.language.panels.tester.pages["0"].description)
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`⛏️ | ${this.language.panels.tester.pages["0"].embeds["0"].title}`)
                                .setDescription(userGrades),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.language.panels.tester.pages["1"].label)
                                .setValue("bot_status")
                                .setDescription(this.language.panels.tester.pages["1"].description)
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`⛏️ | ${this.language.panels.tester.pages["1"].embeds["0"].title}`)
                                .setDescription(botStatus),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.language.panels.tester.pages["2"].label)
                                .setValue("bot_infos")
                                .setDescription(this.language.panels.tester.pages["2"].description)
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`⛏️ | ${this.language.panels.tester.pages["2"].embeds["0"].title}`)
                                .setDescription(`${botInfos}`),
                        ]),
                ])
                .setComponents([
                    new ActionRowBuilder()
                        .setComponents(
                            new SelectMenuBuilder()
                                .setCustomId("tester_panel")
                                .setPlaceholder(this.language.rows.page)
                                .setOptions([
                                    {
                                        value: "user_informations",
                                        label: this.language.panels.tester.pages["0"].label,
                                        description: this.language.panels.tester.pages["0"].description,
                                    },
                                    {
                                        value: "bot_status",
                                        label: this.language.panels.tester.pages["1"].label,
                                        description: this.language.panels.tester.pages["1"].description,
                                    },
                                    {
                                        value: "bot_infos",
                                        label: this.language.panels.tester.pages["2"].label,
                                        description: this.language.panels.tester.pages["2"].description,
                                    },
                                ]),
                        ),
                ]),
            "admin_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel(this.language.strings.admin_panel)
                        .setValue("admin_panel")
                        .setDescription(this.language.panels.admin.identifier_description)
                        .setEmoji("🚀")
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.language.panels.admin.pages["0"].label)
                                .setValue("admin_status_change")
                                .setDescription(this.language.panels.admin.pages["0"].description),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`🚀 | ${this.language.panels.admin.pages["0"].embeds["0"].title}`)
                                .setDescription(`${this.language.panels.admin.pages["0"].embeds["0"].description}\n\u200B`)
                                .setFields([
                                    { name: "» 📝 «", value: this.language.panels.admin.pages["0"].embeds["0"].fields["0"].value, inline: true },
                                    { name: "» 🟢 «", value: this.language.panels.admin.pages["0"].embeds["0"].fields["1"].value, inline: true },
                                    { name: "» 🟡 «", value: this.language.panels.admin.pages["0"].embeds["0"].fields["2"].value, inline: true },
                                    { name: "» 🔴 «", value: this.language.panels.admin.pages["0"].embeds["0"].fields["3"].value, inline: true },
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
                                .setLabel(this.language.panels.admin.pages["1"].label)
                                .setValue("admin_guilds")
                                .setDescription(this.language.panels.admin.pages["1"].description),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`🚀 | ${this.language.panels.admin.pages["1"].embeds["0"].title}`)
                                .setDescription(`${this.language.panels.admin.pages["0"].embeds["0"].description}\n\u200B`)
                                .setFields([
                                    { name: "» 👥 «", value: this.language.panels.admin.pages["1"].embeds["0"].fields["0"].value, inline: true },
                                    { name: "» 🔓 «", value: this.language.panels.admin.pages["1"].embeds["0"].fields["1"].value, inline: true },
                                    { name: "» 🔒 «", value: this.language.panels.admin.pages["1"].embeds["0"].fields["2"].value, inline: true },
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
                                .setLabel(this.language.panels.admin.pages["2"].label)
                                .setValue("admin_vip")
                                .setDescription(this.language.panels.admin.pages["2"].description),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`🚀 | ${this.language.panels.admin.pages["2"].embeds["0"].title}`)
                                .setDescription(`${this.language.panels.admin.pages["2"].embeds["0"].description}\n\u200B`)
                                .setFields([
                                    { name: "» 💎 «", value: this.language.panels.admin.pages["2"].embeds["0"].fields["0"].value, inline: true },
                                    { name: "» 🪄 «", value: this.language.panels.admin.pages["2"].embeds["0"].fields["1"].value, inline: true },
                                    { name: "» 🧲 «", value: this.language.panels.admin.pages["2"].embeds["0"].fields["2"].value, inline: true },
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
                                .setPlaceholder(this.language.rows.page)
                                .setOptions([
                                    {
                                        value: "admin_status_change",
                                        label: this.language.panels.admin.pages["0"].label,
                                        description: this.language.panels.admin.pages["0"].description,
                                    },
                                    {
                                        value: "admin_guilds",
                                        label: this.language.panels.admin.pages["1"].label,
                                        description: this.language.panels.admin.pages["1"].description,
                                    },
                                    {
                                        value: "admin_vip",
                                        label: this.language.panels.admin.pages["2"].label,
                                        description: this.language.panels.admin.pages["2"].description,
                                    },
                                ]),
                        ),
                ]),
            "owner_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel(this.language.strings.owner_panel)
                        .setValue("owner_panel")
                        .setDescription(this.language.panels.owner.identifier_description)
                        .setEmoji("👑")
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.language.panels.owner.pages["0"].label)
                                .setValue("owner_code_execute")
                                .setDescription(this.language.panels.owner.pages["0"].description),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`👑 | ${this.language.panels.owner.pages["0"].embeds["0"].title}`)
                                .setDescription(`${this.language.panels.owner.pages["0"].embeds["0"].description}\n\u200B`)
                                .setFields([
                                    { name: "» 📡 «", value: this.language.panels.owner.pages["0"].embeds["0"].fields["0"].value, inline: true },
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
                        .setPlaceholder(this.language.rows.panel)
                        .setOptions(Object.values(pages).map(option => option.identifier)),
                ),
            new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("leave_panel")
                        .setLabel(this.language.rows.universal.leave_panel)
                        .setStyle("Danger"),
                ),
        ];

        const panel = await this.interaction.reply({
            embeds: pages.tester_panel.pages["0"].embeds,
            components: pages.tester_panel.components.concat(universalRows),
        }).catch(this.client.util.catcherror);
        if (panel === undefined) return;
        const navigation = panel.createMessageComponentCollector({
            filter: inter => inter.user.id === this.interaction.user.id,
            time: 600_000,
            dispose: true,
        });

        let currentPanel = "tester_panel";

        navigation.on("collect", async inter => {
            if (inter.isSelectMenu()) {
                await inter.deferUpdate()
                    .catch(this.client.util.catcherror);
                if (inter.customId === "panel_category_selector") {
                    if (userGrade.asMinimal(userGrade.allGrades).includes(inter.values[0].split("_")[0])) {
                        currentPanel = inter.values[0];
                        const newComponents = [...pages[currentPanel].pages["0"].components];
                        for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                        for (const universalRow of universalRows) newComponents.push(universalRow);

                        panel.interaction.editReply({
                            embeds: pages[currentPanel].pages["0"].embeds,
                            components: newComponents,
                        }).catch(this.client.util.catcherror);
                    }
                    else {
                        inter.followUp({
                            content: `⚠️ ${this.language.strings.no_permissions}`,
                            ephemeral: true,
                        }).catch(this.client.util.catcherror);
                    }
                }
                else if (Object.keys(pages).includes(inter.customId)) {
                    const newComponents = [...pages[currentPanel].pages.find(p => p.identifier.value === inter.values[0]).components];
                    for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                    for (const universalRow of universalRows) newComponents.push(universalRow);

                    panel.interaction.editReply({
                        embeds: pages[currentPanel].pages.find(p => p.identifier.value === inter.values[0]).embeds,
                        components: newComponents,
                    }).catch(this.client.util.catcherror);
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
                        .catch(this.client.util.catcherror);
                    navigation.stop();
                }
                else if (inter.customId === "view_status") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catcherror);
                    inter.followUp({
                        content: `${this.language.strings.actual_bot_status}: **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}`,
                        ephemeral: true,
                    }).catch(this.client.util.catcherror);
                }
                else if (inter.customId === "set_online") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catcherror);
                    if (tempoStatus[0] === "online") {
                        inter.followUp({
                            content: `⚠️ ${this.language.strings.already_set} **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}.`,
                            ephemeral: true,
                        }).catch(this.client.util.catcherror);
                    }
                    else {
                        this.client.statusDb.setOnline();
                        inter.followUp({
                            content: `✅ ${this.language.strings.set_online}`,
                            ephemeral: true,
                        }).catch(this.client.util.catcherror);
                    }
                }
                else if (inter.customId === "set_maintenance") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catcherror);
                    if (tempoStatus[0] === "maintenance") {
                        inter.followUp({
                            content: `⚠️ ${this.language.strings.already_set} **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}.`,
                            ephemeral: true,
                        }).catch(this.client.util.catcherror);
                    }
                    else {
                        this.client.statusDb.setMaintenance();
                        inter.followUp({
                            content: `✅ ${this.language.strings.set_maintenance}`,
                            ephemeral: true,
                        }).catch(this.client.util.catcherror);
                    }
                }
                else if (inter.customId === "set_disabled") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catcherror);
                    if (tempoStatus[0] === "disabled") {
                        inter.followUp({
                            content: `⚠️ ${this.language.strings.already_set} **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}.`,
                            ephemeral: true,
                        }).catch(this.client.util.catcherror);
                    }
                    else {
                        this.client.statusDb.setDisabled();
                        inter.followUp({
                            content: `✅ ${this.language.strings.set_disabled}`,
                            ephemeral: true,
                        }).catch(this.client.util.catcherror);
                    }
                }
                else if (inter.customId === "guilds_list") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catcherror);
                    const posted = await this.client.pasteGGManager.postGuildsList(this.client.guilds.cache);

                    if (posted.status === "success") {
                        const authGuilds = `**» ${this.language.strings.auth_guilds}**:\n`
                            + guilds.cached.map(e => `${e}`).join(" / ");
                        inter.followUp({
                            content: this.language.strings.post_success
                                + `\n\n**• [${posted.result.id}](${posted.result.url})**\n\n`
                                + authGuilds,
                            ephemeral: true,
                        }).catch(this.client.util.catcherror);
                    }
                    else if (posted.status === "error") {
                        inter.followUp({
                            content: `⚠️ ${this.language.strings.post_error}`,
                            ephemeral: true,
                        }).catch(this.client.util.catcherror);
                    }
                }
                else if (inter.customId === "vip_list") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catcherror);
                    const players = await this.client.externalServerDb.players();
                    const playersInfos = `**» ${this.language.strings.vip_players}**:\n`
                        + `${players.cache.vips.map(p => inlineCode(p)).join(" / ")}\n\n`
                        + `**» ${this.language.strings.vipplus_players}**:\n`
                        + players.cache.vipplus.map(p => inlineCode(p)).join(" / ");
                    inter.followUp({
                        content: playersInfos,
                        ephemeral: true,
                    }).catch(this.client.util.catcherror);
                }
                else if (["add_auth_guilds", "remove_auth_guilds", "add_vip", "remove_vip"].includes(inter.customId)) {
                    let modalResponse = undefined;
                    if (inter.customId === "add_auth_guilds") {
                        const modal = new ModalBuilder()
                            .setTitle(this.language.rows.modals.add_auth_guilds.title)
                            .setCustomId("modal_add_auth_guilds")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel(this.language.rows.modals.add_auth_guilds.inputs[0].label)
                                        .setCustomId("guild_added")
                                        .setPlaceholder(this.language.rows.modals.add_auth_guilds.inputs[0].placeholder)
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(this.client.util.catcherror);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(this.client.util.catcherror);
                    }
                    else if (inter.customId === "remove_auth_guilds") {
                        const modal = new ModalBuilder()
                            .setTitle(this.language.rows.modals.remove_auth_guilds.title)
                            .setCustomId("modal_remove_auth_guilds")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel(this.language.rows.modals.remove_auth_guilds.inputs[0].label)
                                        .setCustomId("guild_removed")
                                        .setPlaceholder(this.language.rows.modals.remove_auth_guilds.inputs[0].placeholder)
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(this.client.util.catcherror);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(this.client.util.catcherror);
                    }
                    else if (inter.customId === "add_vip") {
                        const modal = new ModalBuilder()
                            .setTitle(this.language.rows.modals.add_vip.title)
                            .setCustomId("modal_add_vip")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel(this.language.rows.modals.add_vip.inputs[0].label)
                                        .setCustomId("vip_added")
                                        .setPlaceholder(this.language.rows.modals.add_vip.inputs[0].placeholder)
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short),
                                ),
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel(this.language.rows.modals.add_vip.inputs[1].label)
                                        .setCustomId("vipplus_added")
                                        .setPlaceholder(this.language.rows.modals.add_vip.inputs[1].placeholder)
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(this.client.util.catcherror);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(this.client.util.catcherror);
                    }
                    else if (inter.customId === "remove_vip") {
                        const modal = new ModalBuilder()
                            .setTitle(this.language.rows.modals.remove_vip.title)
                            .setCustomId("modal_remove_vip")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel(this.language.rows.modals.remove_vip.inputs[0].label)
                                        .setCustomId("vip_removed")
                                        .setPlaceholder(this.language.rows.modals.remove_vip.inputs[0].placeholder)
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short),
                                ),
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel(this.language.rows.modals.remove_vip.inputs[1].label)
                                        .setCustomId("vipplus_removed")
                                        .setPlaceholder(this.language.rows.modals.remove_vip.inputs[1].placeholder)
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(this.client.util.catcherror);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(this.client.util.catcherror);
                    }

                    if (modalResponse !== undefined) {
                        if (modalResponse.customId === "modal_add_auth_guilds") {
                            const guildIDField = modalResponse.fields.getTextInputValue("guild_added") ?? "null";

                            if (guilds.list.includes(guildIDField)) {
                                modalResponse.reply({
                                    content: `⚠️ ${this.language.strings.is_already_authorized.replace("%GUILD", guildIDField)}`,
                                    ephemeral: true,
                                }).catch(this.client.util.catcherror);
                            }
                            else {
                                modalResponse.reply({
                                    content: `✅ ${this.language.strings.is_authorized.replace("%GUILD", guildIDField)}`,
                                    ephemeral: true,
                                }).catch(this.client.util.catcherror);
                                this.client.internalServerManager.db.push("internalServer", guildIDField, "authServers");
                            }
                        }
                        else if (modalResponse.customId === "modal_remove_auth_guilds") {
                            const guildIDField = modalResponse.fields.getTextInputValue("guild_removed") ?? "null";

                            if (!guilds.list.includes(guildIDField)) {
                                modalResponse.reply({
                                    content: `⚠️ ${this.language.strings.is_already_unauthorized.replace("%GUILD", guildIDField)}`,
                                    ephemeral: true,
                                }).catch(this.client.util.catcherror);
                            }
                            else {
                                modalResponse.reply({
                                    content: `✅ ${this.language.strings.is_unauthorized.replace("%GUILD", guildIDField)}`,
                                    ephemeral: true,
                                }).catch(this.client.util.catcherror);
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
                                    message += `⚠️${this.language.strings.is_already_vip.replace(
                                        "%PLAYER",
                                        escapeMarkdown(this.client.users.fetch(vip)?.username ?? vip),
                                    )}`;
                                }
                                else {
                                    message += `✅ ${this.language.strings.is_vip.replace(
                                        "%PLAYER",
                                        escapeMarkdown(this.client.users.fetch(vip)?.username ?? vip),
                                    )}`;
                                    this.client.externalServerDb.db.push(vip, "vip", "grades");
                                }
                            }
                            if (vipplus.length > 2) {
                                const playerDatas = await this.client.externalServerDb.get(vipplus);
                                if (message.length > 4) message += "\n\n";
                                if (playerDatas.grades.includes("vip+")) {
                                    message += `⚠️${this.language.strings.is_already_vipplus.replace(
                                        "%PLAYER",
                                        escapeMarkdown(this.client.users.fetch(vipplus)?.username ?? vipplus),
                                    )}`;
                                }
                                else {
                                    message += `✅ ${this.language.strings.is_vipplus.replace(
                                        "%PLAYER",
                                        escapeMarkdown(this.client.users.fetch(vipplus)?.username ?? vipplus),
                                    )}`;
                                    this.client.externalServerDb.db.push(vipplus, "vip+", "grades");
                                }
                            }

                            if (message.length > 10) {
                                modalResponse.reply({
                                    content: message,
                                    ephemeral: true,
                                }).catch(this.client.util.catcherror);
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
                                    message += `⚠️ ${this.language.strings.is_already_not_vip.replace(
                                        "%PLAYER",
                                        escapeMarkdown(this.client.users.fetch(vip)?.username ?? vip),
                                    )}`;
                                }
                                else {
                                    message += `✅ ${this.language.strings.is_not_vip.replace(
                                        "%PLAYER",
                                        escapeMarkdown(this.client.users.fetch(vip)?.username ?? vip),
                                    )}`;
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
                                    message += `⚠️ ${this.language.strings.is_already_not_vipplus.replace(
                                        "%PLAYER",
                                        escapeMarkdown(this.client.users.fetch(vipplus)?.username ?? vipplus),
                                    )}`;
                                }
                                else {
                                    message += `✅ ${this.language.strings.is_not_vipplus.replace(
                                        "%PLAYER",
                                        escapeMarkdown(this.client.users.fetch(vipplus)?.username ?? vipplus),
                                    )}`;
                                    this.client.externalServerDb.db.push(vipplus, "vip+", "grades");
                                }
                            }

                            if (message.length > 10) {
                                modalResponse.reply({
                                    content: message,
                                    ephemeral: true,
                                }).catch(this.client.util.catcherror);
                            }
                        }
                    }
                }
                else if (inter.customId === "code_execute") {
                    const modal = new ModalBuilder()
                        .setTitle(this.language.rows.modals.code_execute.title)
                        .setCustomId("modal_code_execute")
                        .setComponents(
                            new ActionRowBuilder().setComponents(
                                new TextInputBuilder()
                                    .setLabel(this.language.rows.modals.code_execute.inputs[0].label)
                                    .setCustomId("code_input")
                                    .setPlaceholder(this.language.rows.modals.code_execute.inputs[0].placeholder)
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Paragraph),
                            ),
                        );

                    await inter.showModal(modal).catch(this.client.util.catcherror);
                    const modalSubmit = await inter.awaitModalSubmit({
                        filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                        time: 300_000,
                    }).catch(this.client.util.catcherror);

                    if (modalSubmit !== undefined) {
                        const codeInput = modalSubmit.fields.getTextInputValue("code_input") ?? "";

                        const resp = await this.client.util.eval(codeInput, this);
                        modalSubmit.reply({
                            content: resp,
                            ephemeral: false,
                        }).catch(this.client.util.catcherror);
                    }
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