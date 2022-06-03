const Command = require("../../base/Command");

class ClearDb extends Command {
    constructor() {
        super({
            adminOnly: true,
            aliases: ["clear-db"],
            args: [],
            category: "Administrateur",
            cooldown: 0,
            description: "C'est privé ! Interdit d'utiliser.",
            examples: ["clear-db"],
            finishRequest: ["clear-db"],
            name: "clear-db",
            ownerOnly: true,
            permissions: 0,
            syntax: "clear-db",
        });
    }

    async run() {
        if (this.message.author.id !== "539842701592494111") return;

        if (this.args.includes("player") || this.args.includes("all")) this.client.playerDb.db.clear();
        if (this.args.includes("activity") || this.args.includes("all")) this.client.activityDb.db.clear();
        if (this.args.includes("inventory") || this.args.includes("all")) this.client.inventoryDb.db.clear();
        if (this.args.includes("squad") || this.args.includes("all")) this.client.squadDb.db.clear();
        if (this.args.includes("map") || this.args.includes("all")) this.client.mapDb.db.clear();
        if (this.args.includes("quest") || this.args.includes("all")) this.client.questDb.db.clear();
    }
}

module.exports = new ClearDb();