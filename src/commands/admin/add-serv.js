const Command = require("../../base/Command");

class AddServ extends Command {
    constructor() {
        super({
            aliases: ["add-serv"],
            args: [["server", "nouveau serveur à autoriser.", true]],
            category: "Admin",
            cooldown: 7,
            description: "Commande permettant de rajouter des serveurs autorisés pour le bot.",
            examples: ["[p]add-serv 922404341107798036"],
            finishRequest: ["Admin"],
            name: "add-serv",
            private: "admins",
            permissions: 0n,
            syntax: "add-serv <server>",
        });
    }

    async run() {
        this.client.internalServerManager.db.push("internalServer", this.args?.at(0) ?? "undefined", "authServers");
        this.message.react("✅");
    }
}

module.exports = AddServ;