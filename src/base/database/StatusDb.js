const Enmap = require("enmap");

class StatusDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "statusDb" });
    }

    model() {
        const datas = {
            // available modes = online, maintenance, disabled
            mode: "online",
        };

        return datas;
    }

    async ensure() {
        const p = this.model();
        this.db.ensure("status", p);

        return this.db.get("status");
    }

    get datas() {
        this.ensure();

        return this.db.get("status");
    }

    async setOnline() {
        this.db.set("status", "online", "mode");

        if (this.client.user.id === "958433246050406440") {
            const channel = this.client.channels.cache.get(this.client.config.channels.uptime);
            await channel.sendTyping();

            channel.send({ embeds: [
                {
                    footer: {
                        text: "Changement de statut",
                    },
                    color: 0x1bff3a,
                    description: `**Horodatage**: <t:${Math.ceil(Date.now() / 1000)}:R>`,
                    title: "🟢 — Le bot est en ligne.",
                },
            ] });
        }
    }

    async setMaintenance() {
        this.db.set("status", "maintenance", "mode");

        if (this.client.user.id === "958433246050406440") {
            const channel = this.client.channels.cache.get(this.client.config.channels.uptime);
            await channel.sendTyping();

            channel.send({ embeds: [
                {
                    footer: {
                        text: "Changement de statut",
                    },
                    color: 0xffcf1b,
                    description: `**Horodatage**: <t:${Math.ceil(Date.now() / 1000)}:R>`,
                    title: "🔨 — Le bot est en maintenance.",
                },
            ] });
        }
    }

    async setDisabled() {
        this.db.set("status", "disabled", "mode");

        if (this.client.user.id === "958433246050406440") {
            const channel = this.client.channels.cache.get(this.client.config.channels.uptime);
            await channel.sendTyping();

            channel.send({ embeds: [
                {
                    footer: {
                        text: "Changement de statut",
                    },
                    color: 0xff2323,
                    description: "*Une erreur est survenue, le mode **sécurité** a été activé.*"
                                 +
                                 `\n\n**Horodatage**: <t:${Math.ceil(Date.now() / 1000)}:R>`,
                    title: "🔨 — Le bot est désactivé.",
                },
            ] });
        }
    }

    async infos() {
        const guilds = this.client.guilds.cache;
        const players = this.client.playerDb.db.array();

        const datas = {
            "guilds": guilds.size,
            "totalMembers": this.client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0),
            "users": this.client.users.cache.size,
            "players": {
                "ensured": players.length,
                "started": players.filter(e => e.started).length,
            },
            "lastServers": guilds.sort((a, b) => b.joinedTimestamp - a.joinedTimestamp),
            "lastPlayers": players.sort((a, b) => b.created - a.created),
        };

        return datas;
    }

}

module.exports = StatusDb;