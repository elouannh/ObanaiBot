const Command = require("../../base/Command");

class Testing extends Command {
    constructor() {
        super({
            category: "Testing",
            cooldown: 7,
            description: "Commande permettant de tester une fonctionnalité.",
            finishRequest: ["Testing"],
            name: "testing",
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        const userLang = (await this.client.playerDb.get(this.interaction.user.id)).lang;
        await this.interaction.reply(this.language.reply.replace("%LANG", userLang));
    }
}

module.exports = Testing;