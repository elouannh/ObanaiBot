const Command = require("../../base/Command");

class RemoveServ extends Command {
    constructor() {
        super({
            category: "Admin",
            cooldown: 7,
            description: "Commande permettant de retirer des serveurs autorisés pour le bot.",
            finishRequest: ["Admin"],
            name: "remove-serv",
            private: "admins",
            permissions: 0n,
        });
    }

    async run() {
        const auth = this.client.internalServerManager.servers;
        this.client.internalServerManager.db.set(
            "internalServer",
            auth.filter(e => e !== this.args?.at(0) ?? "undefined"),
            "authServers",
        );
        this.message.react("✅");
    }
}

module.exports = RemoveServ;