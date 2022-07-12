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

    async setMaintenance() {
        this.db.set("status", "maintenance", "mode");
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

    async setDisabled() {
        this.db.set("status", "disabled", "mode");
        const channel = this.client.channels.cache.get(this.client.config.channels.uptime);

        await channel.sendTyping();

        channel.send({ embeds: [
            {
                footer: {
                    text: "Changement de statut",
                },
                color: 0xff2323,
                description: `*Une erreur est survenue, le mode **sécurité** a été activé.*\n\n**Horodatage**: <t:${Math.ceil(Date.now() / 1000)}:R>`,
                title: "🔨 — Le bot est désactivé.",
            },
        ] });
    }

}

module.exports = { StatusDb };