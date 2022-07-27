const Command = require("../../base/Command");

class RemoveServ extends Command {
    constructor() {
        super({
            aliases: ["remove-serv"],
            args: [["server", "serveur à retirer.", true]],
            category: "Admin",
            cooldown: 7,
            description: "Commande permettant de retirer des serveurs autorisés pour le bot.",
            examples: ["[p]remove-serv 922404341107798036"],
            finishRequest: ["Admin"],
            name: "remove-serv",
            private: "admins",
            permissions: 0n,
            syntax: "remove-serv <server>",
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