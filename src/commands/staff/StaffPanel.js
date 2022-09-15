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
const Nav = require("../../base/Navigation");

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
        const status = await this.client.internalServerManager.status(this.timestamp);
        const infos = await this.client.internalServerManager.infos();

        const renderPanel = rendered => {
            return userGrade.allGrades.includes(rendered[0].split("_")[0]) ? `**${rendered[1]}**` : `~~${rendered[1]}~~`;
        };
        const userGrades = this.lang.strings.home_title
            + `\n\n__${this.lang.strings.your_grades}:__  `
            + userGrade.allGrades
                .filter(e => e.length > 1)
                .map(e => `**${this.lang.strings[`${e}_grade`]}**`).join(" - ")
            + `\n\n${this.lang.strings.panels_accesses_message}:\n`
            + `${Object.entries(this.lang.strings).filter(e => e[0].endsWith("_grade")).map(e => `• ${renderPanel(e)}`).join("\n")}\n\n`
            + `*${this.lang.strings.panels_timeout_message}*`;

        const botStatus = `» ${this.lang.strings.api_ping}: **${status.apiPing}**\n`
            + `» ${this.lang.strings.server_ping}: **${status.serverPing}**\n\n`
            + `» ${this.lang.strings.internal_server_1}: **${status.server1.status}** | **${status.server1.processus}**\n`
            + `» ${this.lang.strings.internal_server_2}: **${status.server2.status}** | **${status.server2.processus}**\n`
            + `» ${this.lang.strings.rpg_status}: **${status.clientStatus}**\n\n`
            + `» ${this.lang.strings.memory} **(${status.memoryPercent})**: **${status.memoryUsage[0]}**/${status.memoryUsage[1]}\n`
            + `» ${this.lang.strings.capacity} **(${status.requestsPercent})**: **${status.requests[0]}**/${status.requests[1]}\n`
            + `» ${this.lang.strings.uptime}: **${status.uptime}**`;

        const botInfos = `» ${this.lang.strings.guilds}: **${infos.guilds}**\n`
            + `» ${this.lang.strings.total_members}: **${infos.totalMembers}**\n`
            + `» ${this.lang.strings.cached_users}: **${infos.users}**\n`
            + `» ${this.lang.strings.players}: **${infos.players.ensured}** | **${infos.players.started}** ayant commencé leur aventure.\n`
            + `» ${this.lang.strings.version}: **${this.client.version}**`;

        const pages = {
            "tester_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel(this.lang.panels.tester.identifier_name)
                        .setValue("tester_panel")
                        .setDescription(this.lang.panels.tester.identifier_description)
                        .setEmoji(this.consts.emojis.systems.grades.tester)
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.lang.panels.tester.pages["0"].label)
                                .setValue("user_informations")
                                .setDescription(this.lang.panels.tester.pages["0"].description)
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`${this.consts.emojis.systems.grades.tester} | ${this.lang.panels.tester.pages["0"].embeds["0"].title}`)
                                .setDescription(userGrades),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.lang.panels.tester.pages["1"].label)
                                .setValue("bot_status")
                                .setDescription(this.lang.panels.tester.pages["1"].description)
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`${this.consts.emojis.systems.grades.tester} | ${this.lang.panels.tester.pages["1"].embeds["0"].title}`)
                                .setDescription(botStatus),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.lang.panels.tester.pages["2"].label)
                                .setValue("bot_infos")
                                .setDescription(this.lang.panels.tester.pages["2"].description)
                                .identifier,
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`${this.consts.emojis.systems.grades.tester} | ${this.lang.panels.tester.pages["2"].embeds["0"].title}`)
                                .setDescription(`${botInfos}`),
                        ]),
                ])
                .setComponents([
                    new ActionRowBuilder()
                        .setComponents(
                            new SelectMenuBuilder()
                                .setCustomId("tester_panel")
                                .setPlaceholder(this.lang.rows.page)
                                .setOptions([
                                    {
                                        value: "user_informations",
                                        label: this.lang.panels.tester.pages["0"].label,
                                        description: this.lang.panels.tester.pages["0"].description,
                                    },
                                    {
                                        value: "bot_status",
                                        label: this.lang.panels.tester.pages["1"].label,
                                        description: this.lang.panels.tester.pages["1"].description,
                                    },
                                    {
                                        value: "bot_infos",
                                        label: this.lang.panels.tester.pages["2"].label,
                                        description: this.lang.panels.tester.pages["2"].description,
                                    },
                                ]),
                        ),
                ]),
            "admin_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel(this.lang.panels.admin.identifier_name)
                        .setValue("admin_panel")
                        .setDescription(this.lang.panels.admin.identifier_description)
                        .setEmoji(this.consts.emojis.systems.grades.admin)
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.lang.panels.admin.pages["0"].label)
                                .setValue("admin_status_change")
                                .setDescription(this.lang.panels.admin.pages["0"].description),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`${this.consts.emojis.systems.grades.admin} | ${this.lang.panels.admin.pages["0"].embeds["0"].title}`)
                                .setDescription(`${this.lang.panels.admin.pages["0"].embeds["0"].description}\n\u200B`)
                                .setFields([
                                    { name: `» ${this.consts.emojis.systems.symbols.edit} «`, value: this.lang.panels.admin.pages["0"].embeds["0"].fields["0"].value, inline: true },
                                    { name: `» ${this.consts.emojis.systems.status.online} «`, value: this.lang.panels.admin.pages["0"].embeds["0"].fields["1"].value, inline: true },
                                    { name: `» ${this.consts.emojis.systems.status.maintenance} «`, value: this.lang.panels.admin.pages["0"].embeds["0"].fields["2"].value, inline: true },
                                    { name: `» ${this.consts.emojis.systems.status.disabled} «`, value: this.lang.panels.admin.pages["0"].embeds["0"].fields["3"].value, inline: true },
                                ]),
                        ])
                        .setComponents([
                            new ActionRowBuilder()
                                .setComponents(
                                    new ButtonBuilder()
                                        .setEmoji(this.consts.emojis.systems.symbols.edit)
                                        .setCustomId("view_status")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji(this.consts.emojis.systems.status.online)
                                        .setCustomId("set_online")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji(this.consts.emojis.systems.status.maintenance)
                                        .setCustomId("set_maintenance")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji(this.consts.emojis.systems.status.disabled)
                                        .setCustomId("set_disabled")
                                        .setStyle("Secondary"),
                                ),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.lang.panels.admin.pages["1"].label)
                                .setValue("admin_guilds")
                                .setDescription(this.lang.panels.admin.pages["1"].description),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`${this.consts.emojis.systems.grades.admin} | ${this.lang.panels.admin.pages["1"].embeds["0"].title}`)
                                .setDescription(`${this.lang.panels.admin.pages["0"].embeds["0"].description}\n\u200B`)
                                .setFields([
                                    { name: `» ${this.consts.emojis.systems.symbols.list} «`, value: this.lang.panels.admin.pages["1"].embeds["0"].fields["0"].value, inline: true },
                                    { name: `» ${this.consts.emojis.systems.symbols.add} «`, value: this.lang.panels.admin.pages["1"].embeds["0"].fields["1"].value, inline: true },
                                    { name: `» ${this.consts.emojis.systems.symbols.remove} «`, value: this.lang.panels.admin.pages["1"].embeds["0"].fields["2"].value, inline: true },
                                ]),
                        ])
                        .setComponents([
                            new ActionRowBuilder()
                                .setComponents(
                                    new ButtonBuilder()
                                        .setEmoji(this.consts.emojis.systems.symbols.list)
                                        .setCustomId("guilds_list")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji(this.consts.emojis.systems.symbols.add)
                                        .setCustomId("add_auth_guilds")
                                        .setStyle("Secondary"),
                                    new ButtonBuilder()
                                        .setEmoji(this.consts.emojis.systems.symbols.remove)
                                        .setCustomId("remove_auth_guilds")
                                        .setStyle("Secondary"),
                                ),
                        ]),
                ])
                .setComponents([
                    new ActionRowBuilder()
                        .setComponents(
                            new SelectMenuBuilder()
                                .setCustomId("admin_panel")
                                .setPlaceholder(this.lang.rows.page)
                                .setOptions([
                                    {
                                        value: "admin_status_change",
                                        label: this.lang.panels.admin.pages["0"].label,
                                        description: this.lang.panels.admin.pages["0"].description,
                                    },
                                    {
                                        value: "admin_guilds",
                                        label: this.lang.panels.admin.pages["1"].label,
                                        description: this.lang.panels.admin.pages["1"].description,
                                    },
                                ]),
                        ),
                ]),
            "owner_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel(this.lang.panels.owner.identifier_name)
                        .setValue("owner_panel")
                        .setDescription(this.lang.panels.owner.identifier_description)
                        .setEmoji(this.consts.emojis.systems.grades.owner)
                        .identifier,
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel(this.lang.panels.owner.pages["0"].label)
                                .setValue("owner_code_execute")
                                .setDescription(this.lang.panels.owner.pages["0"].description),
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle(`${this.consts.emojis.systems.grades.owner} | ${this.lang.panels.owner.pages["0"].embeds["0"].title}`)
                                .setDescription(`${this.lang.panels.owner.pages["0"].embeds["0"].description}\n\u200B`)
                                .setFields([
                                    { name: `» ${this.consts.emojis.systems.symbols.execute} «`, value: this.lang.panels.owner.pages["0"].embeds["0"].fields["0"].value, inline: true },
                                ]),
                        ])
                        .setComponents([
                            new ActionRowBuilder()
                                .setComponents(
                                    new ButtonBuilder()
                                        .setEmoji(this.consts.emojis.systems.symbols.execute)
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
                        .setPlaceholder(this.lang.rows.panel)
                        .setOptions(Object.values(pages).map(option => option.identifier)),
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
            embeds: pages.tester_panel.pages["0"].embeds,
            components: pages.tester_panel.components.concat(universalRows),
        }).catch(this.client.util.catchError);
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
                    .catch(this.client.util.catchError);
                if (inter.customId === "panel_category_selector") {
                    if (userGrade.asMinimal(userGrade.allGrades).includes(inter.values[0].split("_")[0])) {
                        currentPanel = inter.values[0];
                        const newComponents = [...pages[currentPanel].pages["0"].components];
                        for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                        for (const universalRow of universalRows) newComponents.push(universalRow);

                        panel.interaction.editReply({
                            embeds: pages[currentPanel].pages["0"].embeds,
                            components: newComponents,
                        }).catch(this.client.util.catchError);
                    }
                    else {
                        inter.followUp({
                            content: `${this.consts.emojis.systems.symbols.warning} ${this.lang.strings.no_permissions}`,
                            ephemeral: true,
                        }).catch(this.client.util.catchError);
                    }
                }
                else if (Object.keys(pages).includes(inter.customId)) {
                    const newComponents = [...pages[currentPanel].pages.find(p => p.identifier.value === inter.values[0]).components];
                    for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                    for (const universalRow of universalRows) newComponents.push(universalRow);

                    panel.interaction.editReply({
                        embeds: pages[currentPanel].pages.find(p => p.identifier.value === inter.values[0]).embeds,
                        components: newComponents,
                    }).catch(this.client.util.catchError);
                }
            }
            else if (inter.isButton()) {
                const guilds = await this.client.internalServerManager.guilds();
                const tempoStatus = [
                    this.client.internalServerManager.datas.mode,
                    await this.client.internalServerManager.status(this.interaction),
                ];
                if (inter.customId === "leave_panel") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catchError);
                    navigation.stop();
                }
                else if (inter.customId === "view_status") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catchError);
                    inter.followUp({
                        content: `${this.lang.strings.actual_bot_status}: **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}`,
                        ephemeral: true,
                    }).catch(this.client.util.catchError);
                }
                else if (inter.customId === "set_online") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catchError);
                    if (tempoStatus[0] === "online") {
                        inter.followUp({
                            content: `${this.consts.emojis.systems.symbols.warning} ${this.lang.strings.already_set} **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}.`,
                            ephemeral: true,
                        }).catch(this.client.util.catchError);
                    }
                    else {
                        this.client.internalServerManager.setOnline();
                        inter.followUp({
                            content: `${this.consts.emojis.systems.symbols.check} ${this.lang.strings.set_online}`,
                            ephemeral: true,
                        }).catch(this.client.util.catchError);
                    }
                }
                else if (inter.customId === "set_maintenance") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catchError);
                    if (tempoStatus[0] === "maintenance") {
                        inter.followUp({
                            content: `${this.consts.emojis.systems.symbols.warning} ${this.lang.strings.already_set} **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}.`,
                            ephemeral: true,
                        }).catch(this.client.util.catchError);
                    }
                    else {
                        this.client.internalServerManager.setMaintenance();
                        inter.followUp({
                            content: `${this.consts.emojis.systems.symbols.check} ${this.lang.strings.set_maintenance}`,
                            ephemeral: true,
                        }).catch(this.client.util.catchError);
                    }
                }
                else if (inter.customId === "set_disabled") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catchError);
                    if (tempoStatus[0] === "disabled") {
                        inter.followUp({
                            content: `${this.consts.emojis.systems.symbols.warning} ${this.lang.strings.already_set} **${tempoStatus[0]}** ${tempoStatus[1].clientStatus}.`,
                            ephemeral: true,
                        }).catch(this.client.util.catchError);
                    }
                    else {
                        this.client.internalServerManager.setDisabled();
                        inter.followUp({
                            content: `${this.consts.emojis.systems.symbols.check} ${this.lang.strings.set_disabled}`,
                            ephemeral: true,
                        }).catch(this.client.util.catchError);
                    }
                }
                else if (inter.customId === "guilds_list") {
                    await inter.deferUpdate()
                        .catch(this.client.util.catchError);
                    const posted = await this.client.pasteGGManager.postGuildsList(this.client.guilds.cache);

                    if (posted.status === "success") {
                        const authGuilds = `**» ${this.lang.strings.auth_guilds}**:\n`
                            + guilds.cached.map(e => `${e}`).join(" / ");
                        inter.followUp({
                            content: this.lang.strings.post_success
                                + `\n\n**• [${posted.result.id}](${posted.result.url})**\n\n`
                                + authGuilds,
                            ephemeral: true,
                        }).catch(this.client.util.catchError);
                    }
                    else if (posted.status === "error") {
                        inter.followUp({
                            content: `${this.consts.emojis.systems.symbols.warning} ${this.lang.strings.post_error}`,
                            ephemeral: true,
                        }).catch(this.client.util.catchError);
                    }
                }
                else if (["add_auth_guilds", "remove_auth_guilds"].includes(inter.customId)) {
                    let modalResponse = undefined;
                    if (inter.customId === "add_auth_guilds") {
                        const modal = new ModalBuilder()
                            .setTitle(this.lang.rows.modals.add_auth_guilds.title)
                            .setCustomId("modal_add_auth_guilds")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel(this.lang.rows.modals.add_auth_guilds.inputs[0].label)
                                        .setCustomId("guild_added")
                                        .setPlaceholder(this.lang.rows.modals.add_auth_guilds.inputs[0].placeholder)
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(this.client.util.catchError);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(this.client.util.catchError);
                    }
                    else if (inter.customId === "remove_auth_guilds") {
                        const modal = new ModalBuilder()
                            .setTitle(this.lang.rows.modals.remove_auth_guilds.title)
                            .setCustomId("modal_remove_auth_guilds")
                            .setComponents(
                                new ActionRowBuilder().setComponents(
                                    new TextInputBuilder()
                                        .setLabel(this.lang.rows.modals.remove_auth_guilds.inputs[0].label)
                                        .setCustomId("guild_removed")
                                        .setPlaceholder(this.lang.rows.modals.remove_auth_guilds.inputs[0].placeholder)
                                        .setMinLength(18)
                                        .setMaxLength(19)
                                        .setStyle(TextInputStyle.Short),
                                ),
                            );

                        await inter.showModal(modal).catch(this.client.util.catchError);
                        modalResponse = await inter.awaitModalSubmit({
                            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                            time: 15_000,
                        }).catch(this.client.util.catchError);
                    }

                    if (modalResponse !== undefined) {
                        if (modalResponse.customId === "modal_add_auth_guilds") {
                            const guildIDField = modalResponse.fields.getTextInputValue("guild_added") ?? "null";

                            if (guilds.list.includes(guildIDField)) {
                                modalResponse.reply({
                                    content: `${this.consts.emojis.systems.symbols.warning} ${this.lang.strings.is_already_authorized.replace("%GUILD", guildIDField)}`,
                                    ephemeral: true,
                                }).catch(this.client.util.catchError);
                            }
                            else {
                                modalResponse.reply({
                                    content: `${this.consts.emojis.systems.symbols.check} ${this.lang.strings.is_authorized.replace("%GUILD", guildIDField)}`,
                                    ephemeral: true,
                                }).catch(this.client.util.catchError);
                                this.client.internalServerManager.db.push("internalServer", guildIDField, "authServers");
                            }
                        }
                        else if (modalResponse.customId === "modal_remove_auth_guilds") {
                            const guildIDField = modalResponse.fields.getTextInputValue("guild_removed") ?? "null";

                            if (!guilds.list.includes(guildIDField)) {
                                modalResponse.reply({
                                    content: `${this.consts.emojis.systems.symbols.warning} ${this.lang.strings.is_already_unauthorized.replace("%GUILD", guildIDField)}`,
                                    ephemeral: true,
                                }).catch(this.client.util.catchError);
                            }
                            else {
                                modalResponse.reply({
                                    content: `${this.consts.emojis.systems.symbols.check} ${this.lang.strings.is_unauthorized.replace("%GUILD", guildIDField)}`,
                                    ephemeral: true,
                                }).catch(this.client.util.catchError);
                                this.client.internalServerManager.db.set(
                                    "internalServer",
                                    this.client.internalServerManager.datas.authServers.filter(s => s !== guildIDField),
                                    "authServers",
                                );
                            }
                        }
                    }
                }
                else if (inter.customId === "code_execute") {
                    const modal = new ModalBuilder()
                        .setTitle(this.lang.rows.modals.code_execute.title)
                        .setCustomId("modal_code_execute")
                        .setComponents(
                            new ActionRowBuilder().setComponents(
                                new TextInputBuilder()
                                    .setLabel(this.lang.rows.modals.code_execute.inputs[0].label)
                                    .setCustomId("code_input")
                                    .setPlaceholder(this.lang.rows.modals.code_execute.inputs[0].placeholder)
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Paragraph),
                            ),
                        );

                    await inter.showModal(modal).catch(this.client.util.catchError);
                    const modalSubmit = await inter.awaitModalSubmit({
                        filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
                        time: 300_000,
                    }).catch(this.client.util.catchError);

                    if (modalSubmit !== undefined) {
                        const codeInput = modalSubmit.fields.getTextInputValue("code_input") ?? "";

                        const resp = await this.client.util.evalCode(codeInput, this);
                        modalSubmit.reply({
                            content: resp,
                            ephemeral: false,
                        }).catch(this.client.util.catchError);
                    }
                }
            }
        });

        navigation.on("end", async () => {
            panel.interaction.editReply({ embeds: panel.embeds, components: [] })
                .catch(this.client.util.catchError);
        });
    }
}

module.exports = StaffPanel;