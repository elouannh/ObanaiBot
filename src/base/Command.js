const { PermissionsBitField } = require("discord.js");
const Language = require("./Language");

class Command {
    constructor(infos = {
        name: "command",
        description: "Description par défaut de la commande.",
        descriptionLocalizations: {
            "en-US": "Default command description.",
        },
        options: [],
        type: [1],
        dmPermission: true,
        category: "Staff",
        cooldown: 5,
        completedRequests: ["command"],
        authorizationBitField: 0b000,
        permissions: 0n,
    }) {
        this.infos = infos;
        this.client = null;
        this.interaction = null;
        this.consts = null;
        this.instancedAt = Date.now();
        this.lang = new Language("fr").json["commands"][this.infos.name];
    }

    init(client, interaction, lang) {
        this.client = client;
        this.interaction = interaction;
        this.lang = {};
        for (const [key, value] of Object.entries(lang.json)) {
            if (key === "commands") {
                for (const [key2, value2] of Object.entries(value)) {
                    if (key2 === this.infos.name) {
                        for (const [key3, value3] of Object.entries(value2)) this.lang[key3] = value3;
                    }
                }
            }
            else {
                this.lang[key] = value;
            }
        }
    }

    async exe() {
        await this.interaction.reply({ content: this.lang.systems.defaultReply }).catch(this.client.util.catchError);
    }

    async cooldownReady(forExecuting) {
        let ready = true;

        const lastRun = this.client.cooldownsManager.getSub(this.interaction.user.id, this.infos.name);
        const tStamp = Date.now();
        const readyForRun = lastRun + this.infos.cooldown * 1000;

        if (tStamp < readyForRun) {
            ready = false;
            await this.interaction.reply({
                content: this.lang.systems.cooldownReply.replace(
                    "%TIME",
                    new this.client.duration(readyForRun, this.lang._id).convert(readyForRun - tStamp),
                ),
            }).catch(this.client.util.catchError);
        }
        else {
            this.client.cooldownsManager.add(this.interaction.user.id, { key: this.infos.name, value: Date.now() });

            if (forExecuting) {
                setTimeout(() => {
                    this.client.cooldownsManager.remove(this.interaction.user.id, this.infos.name);
                }, this.infos.cooldown * 1000);
            }
        }

        return ready;
    }

    async requestReady(user = undefined) {
        let ready = true;

        const notFinished = this.client.requestsManager.has(user ?? this.interaction.user.id);

        if (notFinished.length > 0) {
            ready = false;
            await this.interaction.reply({
                content: `🛠️ ${this.lang.systems.requestsReply}\n\n${
                    notFinished.map(e => `» **\`${e.name}\`** - <t:${(e.ts / 1000).toFixed(0)}:F>`)
                }`,
            }).catch(this.client.util.catchError);
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
            }).catch(this.client.util.catchError);
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
                }).catch(this.client.util.catchError);
            }
        }
        return hasPerms;
    }

    async authorizationsReady() {
        let ready = true;

        const userBitField = this.client.internalServerManager.userBitField(this.interaction.user.id);
        const commandBitField = `0b${parseInt(String(this.infos.authorizationBitField), 2)}`;

        if (Number(userBitField) < Number(commandBitField)) {
            ready = false;
            await this.interaction.reply({
                content: this.lang.systems.noUserAuthorizationReply,
            }).catch(this.client.util.catchError);
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
                }).catch(this.client.util.catchError);
            }
        }

        return ready;
    }

    async getUserFromInteraction(interactionType) {
        const user = this.interaction.user;
        let userId = user.id;
        if (interactionType === 1) userId = this.interaction.options?.get("joueur")?.user?.id;
        else if (interactionType === 2) userId = this.client.users.cache.get(this.interaction.targetId);
        return (await this.client.getUser(userId, user)).userId;
    }
}

module.exports = Command;