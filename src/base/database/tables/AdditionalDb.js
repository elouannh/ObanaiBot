const SQLiteTable = require("../../SQLiteTable");
const AdditionalData = require("../dataclasses/AdditionalData");

function schema(id) {
    return {
        id: id,
        rpg: {
            commandsAmount: {},
            tutorialProgress: {},
        },
    };
}

class AdditionalDb extends SQLiteTable {
    constructor(client) {
        super(client, "additional", schema);
    }

    async load(id) {
        return new AdditionalData(this.client, this.get(id));
    }

    /**
     * Increments the count of utilisations of a command.
     * @param {String} id
     * @param {String} commandName
     * @returns {void}
     */
    incrementCommand(id, commandName) {
        this.ensureInDeep(id);
        const data = this.get(id);
        if (commandName in data.rpg.commandsAmount) this.set(id, data.rpg.commandsAmount[commandName] + 1, `rpg.commandsAmount.${commandName}`);
        else this.set(id, 1, `rpg.commandsAmount.${commandName}`);
    }
}

module.exports = AdditionalDb;