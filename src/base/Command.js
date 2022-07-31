const { Collection, PermissionsBitField } = require("discord.js");
const convertDate = require("../utils/convertDate");
const Context = require("./Context");
const fs = require("fs");

const sections = {
    "Commandes Globales": ["Utilitaire"],
    "Commandes du RPG Demon Slayer": ["Combats", "Escouades", "Exploration", "Quêtes", "Stats"],
    "Commandes du Personnel": ["Testing", "Admin", "Owner"],
};

class Command {
    constructor(infos = {
        adminOnly: false,
        aliases: [""],
        args: [],
        category: "",
        cooldown: 10,
        description: "",
        examples: [],
        finishRequest: [],
        name: "",
        private: "none",
        permissions: 0n,
        syntax: "",
    }) {
        this.infos = infos;
        this.client = null;
        this.message = null;
        this.args = null;
        this.ctx = null;

        if (this.infos.finishRequest === "ADVENTURE") {
            const req = [];

            fs.readdirSync("./src/commands")
                .filter(cat => sections["Commandes du RPG Demon Slayer"].includes(cat))
                .forEach(folder => {
                    const files = fs.readdirSync(`./src/commands/${folder}`);

                    files.forEach(file => req.push(file.replace(".js", "")));
                });

            this.infos.finishRequest = req;
        }
    }

    init(client, message, args, guildPrefix) {
        this.client = client;
        this.message = message;
        this.args = args;
        this.prefix = guildPrefix;
        this.ctx = new Context(this.client, this);
    }

    async exe() {
        await this.message.channel.send("this is a default reply.");
    }

    async cooldownReady(forExecuting) {
        let ready = true;
        // ...............................................................................<string, Date>
        if (!this.client.cooldowns.has(this.infos.name)) this.client.cooldowns.set(this.infos.name, new Collection());
        if (!this.client.cooldowns.get(this.infos.name).has(this.message.author.id)) {
            this.client.cooldowns.get(this.infos.name)
                                 .set(this.message.author.id, Date.now() - this.infos.cooldown * 1000);
        }

        const lastRun = this.client.cooldowns.get(this.infos.name).get(this.message.author.id);
        const tStamp = Date.now();
        const readyForRun = lastRun + this.infos.cooldown * 1000;

        if (tStamp < readyForRun) {
            ready = false;
            await this.ctx.reply(
                "Veuillez patienter.",
                `Merci d'attendre \`${convertDate(readyForRun - tStamp, true).string}\``
                +
                " avant de pouvoir refaire cette commande.",
                null,
                null,
                "timeout",
            );
        }
        else {
            this.client.cooldowns.get(this.infos.name).delete(this.message.author.id);

            if (forExecuting) {
                setTimeout(() => {
                    this.client.cooldowns.get(this.infos.name).set(this.message.author.id, Date.now());
                }, this.command);
            }
        }

        return ready;
    }

    async requestReady(user = undefined) {
        let ready = true;

        const notFinished = this.client.requestsManager.has(user ?? this.message.author.id);

        if (notFinished.length > 0) {
            ready = false;
            await this.ctx.send(`Vous avez déjà des commandes en cours d'execution qui doivent se terminer:\n\n${
                notFinished.map(e => `**${e.name}** - <t:${(e.ts / 1000).toFixed(0)}:F>`)
            }`, "🛠️", true, user ?? undefined);
        }

        return ready;
    }

    async permissionsReady() {
        const userPermissions = this.message.member.permissionsIn(this.message.channel).toArray();
        if (this.infos.permissions === 0) return true;
        const requiredPermissions = new PermissionsBitField(this.infos.permissions).toArray();

        const hasPerms = requiredPermissions.every(p => userPermissions.includes(p));

        if (!hasPerms) {
            const missingPermissions = requiredPermissions.filter(p => !userPermissions.includes(p));
            await this.ctx.reply(
                "Vous n'avez pas les permissions.",
                "L'exécution de cette commande require des permissions, et il semblerait que vous ne les ayez pas."
                +
                `\nPermissions nécessaires:\n\`\`\`${missingPermissions.join(" / ")}\`\`\``,
                null,
                null,
                "warning",
            );
        }
        return hasPerms;
    }

    async clientPermissionsReady() {
        const clientMember = this.message.guild.members.cache.get(this.client.user.id)
                                                             .permissionsIn(this.message.channel);
        const clientBitfield = new PermissionsBitField(this.client.bitfield).toArray();
        const clientPermissions = clientMember.toArray().filter(p => clientBitfield.includes(p));

        const hasPerms = clientBitfield.every(p => clientPermissions.includes(p));

        if (!hasPerms) {
            const missingPermissions = clientBitfield.filter(p => !clientPermissions.includes(p));
            if (clientMember.has(2048n)) {
                await this.ctx.reply(
                    "Je n'ai pas les permissions.",
                    "L'exécution de cette commande require des permissions, et il semblerait que je ne les ai pas."
                    +
                    `\nPermissions nécessaires:\n\`\`\`${missingPermissions.join(" / ")}\`\`\``,
                    null,
                    null,
                    "error",
                );
            }
        }
        return hasPerms;
    }

    async commandPrivateReady() {
        let ready = true;

        switch (this.infos.private) {
            case "none":
                break;
            case "testers":
                if (!this.client.internalServerManager.staffs.includes(this.message.author.id)) {
                    ready = false;
                }
                break;
            case "admins":
                if (
                    !this.client.internalServerManager.admins.concat(this.client.internalServerManager.owners)
                                                             .includes(this.message.author.id)
                ) {
                    ready = false;
                }
                break;
            case "owners":
                if (!this.client.internalServerManager.owners.includes(this.message.author.id)) {
                    ready = false;
                }
                break;
        }

        if (!ready) {
            await this.ctx.reply(
                "Vous n'avez pas l'autorisation.",
                "L'accès à cette commande est limitée, et vous semblez ne pas avoir les autorisations pour l'exécuter.",
                null,
                null,
                "error",
            );
        }

        return ready;
    }

    async clientStatusReady() {
        let ready = true;

        const clientStatus = this.client.statusDb.datas;

        switch (clientStatus.mode) {
            case "online":
                break;
            case "maintenance":
                if (this.infos.private === "none") {
                    if (!this.client.internalServerManager.staffs.includes(this.message.author.id)) {
                        ready = false;
                        await this.ctx.reply(
                            "Maintenance.",
                            "Le bot est actuellement en maintenance. Plus d'informations ici: "
                            +
                            "**https://bit.ly/obanaihelp**.",
                            "🚧",
                            null,
                            "warning",
                        );
                    }
                    else if (this.infos.private === "none") {
                        ready = false;
                        await this.ctx.reply(
                            "Maintenance.",
                            "Le bot est actuellement en maintenance. Plus d'informations ici: "
                            +
                            "**https://bit.ly/obanaihelp**.",
                            "🚧",
                            null,
                            "warning",
                        );
                    }
                }
                break;
            case "disabled":
                if (!this.client.internalServerManager.staffs.includes(this.message.author.id)) {
                    ready = false;
                }
                else if (this.client.internalServerManager.owners.includes(this.message.author.id)) {
                    ready = true;
                }
                else if (this.infos.private === "none") {
                    ready = false;
                    this.message.react("❌");
                }
                break;
        }

        return ready;
    }
}

module.exports = Command;