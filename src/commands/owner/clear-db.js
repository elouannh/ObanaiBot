const Command = require("../../base/Command");

class ClearDb extends Command {
    constructor() {
        super({
            category: "Owner",
            cooldown: 3,
            description: "Commande permettant de clear directement une base de données dans son intégralité.",
            finishRequest: ["clear-db"],
            name: "clear-db",
            private: "owners",
            permissions: 0n,
        });
    }

    async run() {
        if (this.args.includes("player") || this.args.includes("all")) this.client.playerDb.db.clear();
        if (this.args.includes("activity") || this.args.includes("all")) this.client.activityDb.db.clear();
        if (this.args.includes("inventory") || this.args.includes("all")) this.client.inventoryDb.db.clear();
        if (this.args.includes("squad") || this.args.includes("all")) this.client.squadDb.db.clear();
        if (this.args.includes("map") || this.args.includes("all")) this.client.mapDb.db.clear();
        if (this.args.includes("quest") || this.args.includes("all")) this.client.questDb.db.clear();
    }
}

module.exports = ClearDb;