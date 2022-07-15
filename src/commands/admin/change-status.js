const Command = require("../../base/Command");

class ChangeStatus extends Command {
    constructor() {
        super({
            aliases: ["change-status"],
            args: [["status", "nouveau statut du bot à mettre.", true]],
            category: "Admin",
            cooldown: 7,
            description: "Commande permettant de changer le statut du bot.",
            examples: ["[p]change-status online", "[p]change-status maintenance"],
            finishRequest: ["Admin"],
            name: "change-status",
            private: "admins",
            permissions: 0n,
            syntax: "change-status <status>",
        });
    }

    async run() {
        const status = await this.client.statusDb.datas.mode;

        switch (this.args?.at(0) ?? "") {
            case "online":
                if (status !== "online") await this.client.statusDb.setOnline();
                this.message.react("✅");
                break;
            case "disabled":
                if (status !== "disabled") await this.client.statusDb.setDisabled();
                this.message.react("✅");
                break;
            case "maintenance":
                if (status !== "maintenance") await this.client.statusDb.setMaintenance();
                this.message.react("✅");
                break;
            default:
                break;
        }
    }
}

module.exports = ChangeStatus;