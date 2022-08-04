const Command = require("../../base/Command");

class AddServ extends Command {
    constructor() {
        super({
            category: "Admin",
            cooldown: 7,
            description: "Commande permettant de rajouter des serveurs autorisés pour le bot.",
            finishRequest: ["Admin"],
            name: "add-serv",
            private: "admins",
            permissions: 0n,
        });
    }

    async run() {
        this.client.internalServerManager.db.push("internalServer", this.args?.at(0) ?? "undefined", "authServers");
        this.message.react("✅");
    }
}

module.exports = AddServ;