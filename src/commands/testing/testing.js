const Command = require("../../base/Command");

class Testing extends Command {
    constructor() {
        super({
            aliases: ["testing"],
            args: [],
            category: "Testing",
            cooldown: 7,
            description: "Commande permettant de tester une fonctionnalité.",
            examples: ["[p]testing"],
            finishRequest: ["Testing"],
            name: "testing",
            private: "testers",
            permissions: 0n,
            syntax: "testing",
        });
    }

    async run() {
    }
}

module.exports = Testing;