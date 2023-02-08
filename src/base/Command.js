const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const Language = require("./Language");

class Command {
    constructor(
        slashBuilder = {
            name: "command",
            description: "Description par défaut de la commande.",
            descriptionLocalizations: {
                "en-US": "Default command description.",
            },
            options: [],
            dmPermission: false,
        },
        contextBuilder = {
            name: "Command",
            dmPermission: false,
        },
        infos = {
            trad: "command",
            type: [1],
            category: "Staff",
            cooldown: 5,
            completedRequests: ["command"],
            authorizationBitField: 0b000,
            permissions: 0n,
            targets: [],
        },
    ) {
        this.slashBuilder = slashBuilder;
        this.contextBuilder = contextBuilder;
        this.infos = infos;
        this.client = null;
        this.interaction = null;
        this.mention = "";
        this.lang = new Language("fr").json;
        this.trad = this.lang["commands"][this.infos.trad || this.slashBuilder.name];
        this.langManager = null;
    }

    init(client, interaction, lang) {
        this.client = client;
        this.interaction = interaction;
        this.mention = `<@${this.interaction.user.id}>, `;
        this.lang = lang.json;
        this.trad = this.lang["commands"][this.infos.trad || this.slashBuilder.name];
        this.langManager = this.client.languageManager;

        if (this.infos.completedRequests.includes("adventure")) {
            this.infos.completedRequests = this.infos.completedRequests.concat(Array.from(
                    this.client.commandManager.commands.filter(e =>
                        new (e)().infos.targets.includes("read") || new (e)().infos.targets.includes("write"),
                    ).keys(),
                ));
        }
        else if (this.infos.completedRequests.includes("adventureLocal")) {
            this.infos.completedRequests = this.infos.completedRequests.concat(Array.from(
                this.client.commandManager.commands.filter(e =>
                    new (e)().infos.targets.includes("write"),
                ).keys(),
            ));
        }
        this.infos.completedRequests = this.infos.completedRequests.filter(e => e !== "adventure");
    }

    end() {
        this.client.requestsManager.remove(this.interaction.user.id, this.slashBuilder.name);
        return void 0;
    }

    async exe() {
        await this.interaction.reply({ content: this.lang.systems.defaultReply }).catch(this.client.catchError);
    }

    async cooldownReady(forExecuting) {
        let ready = true;

        const lastRun = this.client.cooldownsManager.getSub(this.interaction.user.id, this.slashBuilder.name);
        const tStamp = Date.now();
        const readyForRun = lastRun + this.infos.cooldown * 1000;

        if (tStamp < readyForRun) {
            ready = false;

            const timeLeftString = new this.client.duration(readyForRun - tStamp, this.lang.systems.timeUnits);
            timeLeftString.setFormat("y", "mo", "w", "d", "h", "m", "s");

            await this.interaction.reply({
                content: this.lang.systems.cooldownReply.replace(
                    "%TIME",
                    `**${timeLeftString.convert("long", true)}**`,
                ),
                ephemeral: true,
            }).catch(this.client.catchError);
        }
        else {
            this.client.cooldownsManager.add(this.interaction.user.id, { key: this.slashBuilder.name, value: Date.now() });

            if (forExecuting) {
                setTimeout(() => {
                    this.client.cooldownsManager.remove(this.interaction.user.id, this.slashBuilder.name);
                }, this.infos.cooldown * 1000);
            }
        }

        return ready;
    }

    async requestReady(user = undefined) {
        let ready = true;

        const notFinished = this.client.requestsManager
            .has(user ?? this.interaction.user.id)
            .filter(e => this.infos.completedRequests.includes(e.name));

        if (notFinished.length > 0) {
            ready = false;
            await this.interaction.reply({
                content: `🛠️ ${this.lang.systems.requestsReply}\n\n${
                    notFinished.map(
                        e => `» [**\`${e.name}\`**](${e.link}) - <t:${(e.ts / 1000).toFixed(0)}:F>`,
                    ).join("\n")
                }`,
                ephemeral: true,
            }).catch(this.client.catchError);
        }

        return ready;
    }

    async permissionsReady() {
        const userPermissions = this.interaction.member.permissionsIn(this.interaction.channel).toArray();
        if (this.infos.permissions === 0) return true;
        const requiredPermissions = new PermissionsBitField(this.infos.permissions).toArray();

        const hasPerms = requiredPermissions.every(p => userPermissions.includes(p));

        if (!hasPerms) {
            const missingPermissions = requiredPermissions.filter(p => !userPermissions.includes(p));
            await this.interaction.reply({
                content: `${this.lang.systems.noUserPermissionsReady}`
                +
                `\n${this.lang.systems.necessariesPermissionsReply}:\n\`\`\`${missingPermissions.join(" / ")}\`\`\``,
                ephemeral: true,
            }).catch(this.client.catchError);
        }
        return hasPerms;
    }

    async clientPermissionsReady() {
        const clientMember = this.interaction.guild.members.cache.get(this.client.user.id)
                                                             .permissionsIn(this.interaction.channel);
        const clientBitfield = new PermissionsBitField(this.client.bitfield).toArray();
        const clientPermissions = clientMember.toArray().filter(p => clientBitfield.includes(p));

        const hasPerms = clientBitfield.every(p => clientPermissions.includes(p));

        if (!hasPerms) {
            const missingPermissions = clientBitfield.filter(p => !clientPermissions.includes(p));
            if (clientMember.has(2048n)) {
                await this.interaction.reply({
                    content: `${this.lang.systems.noClientPermissionsReply}`
                        +
                        `\n${this.lang.systems.necessariesPermissionsReply}:\n\`\`\`${missingPermissions.join(" / ")}\`\`\``,
                    ephemeral: true,
                }).catch(this.client.catchError);
            }
        }
        return hasPerms;
    }

    async authorizationsReady() {
        let ready = true;

        const userBitField = this.client.internalServerManager.userBitField(this.interaction.user.id);
        const commandBitField = this.infos.authorizationBitField;

        if (Number(userBitField) < Number(commandBitField)) {
            ready = false;
            await this.interaction.reply({
                content: this.lang.systems.noUserAuthorizationReply,
                ephemeral: true,
            }).catch(this.client.catchError);
        }

        return ready;
    }

    async clientStatusReady() {
        let ready = true;

        const userBitField = this.client.internalServerManager.userBitField(this.interaction.user.id);
        const statusMode = this.client.internalServerManager.statusMode;
        const statusBitField = `0b${parseInt(statusMode.replace("0b", "").slice(1), 2)}`;
        const replyMode = `0b${parseInt(statusMode.replace("0b", "")[0], 2)}`;

        if (Number(userBitField) < Number(statusBitField)) {
            ready = false;
            if (Number(replyMode) === 1) {
                await this.interaction.reply({
                    content: this.lang.systems.clientInMaintenance,
                    ephemeral: true,
                }).catch(this.client.catchError);
            }
        }

        return ready;
    }

    async getUserFromInteraction(interactionType) {
        const user = this.interaction.user;
        let userId = user.id;
        if (interactionType === 1) {
            userId = this.interaction.options?.get("user")?.user?.id || userId;
        }
        else if (interactionType === 2) {
            userId = this.client.users.cache.get(this.interaction.options.getUser("user")?.id)?.id || userId;
        }
        return await this.client.getUser(userId, user);
    }

    async choice(messagePayload, primary, secondary, removeWarn = false) {
        const message = await this.interaction.editReply(Object.assign(
            messagePayload, {
                components: [
                    new ActionRowBuilder()
                        .setComponents(
                            new ButtonBuilder()
                                .setLabel(primary)
                                .setStyle(ButtonStyle.Primary)
                                .setCustomId("primary"),
                            new ButtonBuilder()
                                .setLabel(secondary)
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId("secondary"),
                        ),
                ],
            },
        )).catch(this.client.catchError);

        const collected = await message.awaitMessageComponent({
            filter: i => i.user.id === this.interaction.user.id,
            time: 60_000,
        }).catch(this.client.catchError);

        if (removeWarn) {
            if (!collected) {
                await this.interaction.editReply({ components: [] }).catch(this.client.catchError);
                return null;
            }
        }
        else if (!collected) {
            await this.interaction.editReply({ content: this.lang.systems.choiceIgnored, components: [] })
                .catch(this.client.catchError);
            return null;
        }
        await collected.deferUpdate().catch(this.client.catchError);
        return collected.customId;
    }

    async menu(messagePayload, options, min = null, max = null, removeCancelOption = false, removeWarn = false) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("menu")
            .setOptions(
                !removeCancelOption ?
                    [
                        {
                            label: this.lang.systems.menuCancel,
                            value: "cancel",
                            emoji: this.client.enums.Systems.Symbols.Cross,
                        },
                    ].concat(options)
                    : options,
            );

        if (min !== null) menu.setMinValues(min);
        if (max !== null) menu.setMaxValues(max);

        const message = await this.interaction.editReply(Object.assign(
            messagePayload, {
                components: [
                    new ActionRowBuilder()
                        .setComponents(menu),
                ],
            },
        )).catch(this.client.catchError);

        const collected = await message.awaitMessageComponent({
            filter: i => i.user.id === this.interaction.user.id,
            time: 60_000,
        }).catch(this.client.catchError);

        if (removeWarn) {
            if (!collected || collected.values[0] === "cancel") {
                await this.interaction.editReply({ components: [] }).catch(this.client.catchError);
                return null;
            }
        }
        else {
            if (!collected) {
                await this.interaction.editReply({ content: this.lang.systems.choiceIgnored, components: [] })
                    .catch(this.client.catchError);
                return null;
            }
            if (collected.values[0] === "cancel") {
                await this.interaction.editReply({ content: this.lang.systems.choiceCanceled, components: [] })
                    .catch(this.client.catchError);
                return null;
            }
        }
        await collected.deferUpdate().catch(this.client.catchError);
        return collected.values;
    }

    async return(content, ephemeral = false) {
        await this.interaction.editReply({ content, ephemeral, components: [] }).catch(this.client.catchError);
        return this.end();
    }

    async message() {
        try {
            return await this.interaction.fetchReply().catch(this.client.catchError);
        }
        catch {
            return null;
        }
    }

    async editContent(messagePayload) {
        const message = await this.message();
        if (!message) return;
        await message.edit(messagePayload).catch(this.client.catchError);
        return 0;
    }
}

module.exports = Command;