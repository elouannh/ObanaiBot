const { PermissionsBitField } = require("discord.js");
const fs = require("fs");

const sections = {
    "Commandes Globales": ["Utilitaire"],
    "Commandes du RPG Demon Slayer": ["Combats", "Escouades", "Exploration", "Quêtes", "Stats"],
    "Commandes du Personnel": ["Testing", "Admin", "Owner"],
};

class Command {
    constructor(infos = {
        adminOnly: false,
        category: "",
        cooldown: 10,
        description: "",
        finishRequest: [],
        name: "",
        private: "none",
        permissions: 0n,
    }) {
        this.infos = infos;
        this.client = null;
        this.interaction = null;

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

    init(client, interaction) {
        this.client = client;
        this.interaction = interaction;
    }

    async exe() {
        await this.interaction.reply("this is a default reply.");
    }

    async cooldownReady(forExecuting) {
        let ready = true;

        const lastRun = this.client.cooldownsManager.getSub(this.interaction.user.id, this.infos.name);
        const tStamp = Date.now();
        const readyForRun = lastRun + this.infos.cooldown * 1000;

        if (tStamp < readyForRun) {
            ready = false;
            await this.interaction.reply(
                ` ⏳ Veuillez patienter \`${this.client.util.convertDate(readyForRun - tStamp, true).string}\``
                +
                " avant de refaire cette commande.",
            );
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
            await this.interaction.reply(`🛠️ Vous avez déjà des commandes en cours d'execution qui doivent se terminer:\n\n${
                notFinished.map(e => `» **\`${e.name}\`** - <t:${(e.ts / 1000).toFixed(0)}:F>`)
            }`);
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
            await this.interaction.reply(
                "L'exécution de cette commande require des permissions, et il semblerait que vous ne les ayez pas."
                +
                `\nPermissions nécessaires:\n\`\`\`${missingPermissions.join(" / ")}\`\`\``,
            );
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
                await this.interaction.reply(
                    "L'exécution de cette commande require des permissions, et il semblerait que je ne les ai pas."
                    +
                    `\nPermissions nécessaires:\n\`\`\`${missingPermissions.join(" / ")}\`\`\``,
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
                if (!this.client.internalServerManager.staffs.includes(this.interaction.user.id)) {
                    ready = false;
                }
                break;
            case "admins":
                if (
                    !this.client.internalServerManager.admins.concat(this.client.internalServerManager.owners)
                                                             .includes(this.interaction.user.id)
                ) {
                    ready = false;
                }
                break;
            case "owners":
                if (!this.client.internalServerManager.owners.includes(this.interaction.user.id)) {
                    ready = false;
                }
                break;
        }

        if (!ready) {
            await this.interaction.reply(
                "L'accès à cette commande est limitée, et vous semblez ne pas avoir les autorisations pour l'exécuter.",
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
                    if (!this.client.internalServerManager.staffs.includes(this.interaction.user.id)) {
                        ready = false;
                        await this.interaction.reply(
                            "Le bot est actuellement en maintenance. Plus d'informations ici: "
                            +
                            "**https://bit.ly/obanaihelp**.",
                        );
                    }
                    else if (this.infos.private === "none") {
                        ready = false;
                        await this.interaction.reply(
                            "Le bot est actuellement en maintenance. Plus d'informations ici: "
                            +
                            "**https://bit.ly/obanaihelp**.",
                        );
                    }
                }
                break;
            case "disabled":
                if (!this.client.internalServerManager.staffs.includes(this.interaction.user.id)) {
                    ready = false;
                }
                else if (this.client.internalServerManager.owners.includes(this.interaction.user.id)) {
                    ready = true;
                }
                else if (this.infos.private === "none") {
                    ready = false;
                    this.interaction.reply("❌");
                }
                break;
        }

        return ready;
    }
}

module.exports = Command;