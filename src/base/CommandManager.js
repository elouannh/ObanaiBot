const { Collection, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

class CommandManager {
    constructor(client, dir = "./src/commands/") {
        this.client = client;
        this.dir = dir;

        // .............<string, Command>
        this.commands = new Collection();
    }

    loadFiles() {
        const commandFolders = fs.readdirSync(this.dir);
        commandFolders.forEach(folder => {
            const files = fs.readdirSync(`${this.dir}${folder}/`);

            for (const file of files) {
                const command = require(`../commands/${folder}/${file}`);
                this.commands.set(new (command)().infos.name, command);
            }
        });

        const slashCommands = this.commands.map(cmd => new SlashCommandBuilder(cmd).setName(new cmd().infos.name).setDescription(new cmd().infos.description.substring(0, 100))).map(cmd => cmd.toJSON());
        this.client.application.commands.set(slashCommands);
    }

    getCommand(name) {
        if (this.commands.has(name)) { return this.commands.get(name); }
        else {
            const validCommands = this.commands.filter(c => new c().infos.aliases.includes(name));
            if (validCommands.map(e => e).length) return validCommands.first();
            return 0;
        }
    }

    async isOverloaded() {
        return this.client.requestsManager.totalSize >= this.client.maxRequests;
    }
}

module.exports = CommandManager;