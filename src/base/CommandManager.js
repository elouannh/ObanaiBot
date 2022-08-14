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
        if (this.client.registerSlash) {
            const commandFolders = fs.readdirSync(this.dir);
            commandFolders.forEach(folder => {
                const files = fs.readdirSync(`${this.dir}${folder}/`);

                for (const file of files) {
                    const command = require(`../commands/${folder}/${file}`);
                    if (new (command)().infos?.type !== undefined) {
                        this.commands.set(new (command)().infos.name, command);
                    }
                }
            });

            const slashCommands = this.commands.map(cmd =>
                new SlashCommandBuilder()
                    .setName(new cmd().infos.name)
                    .setDescription(new cmd().infos.description.substring(0, 100))
                    .setDescriptionLocalizations(new cmd().infos.descriptionLocalizations)
                    .setDMPermission(new cmd().infos.dmPermission),
            ).map(cmd => cmd.toJSON());
            this.client.application.commands.set(slashCommands);
            for (const guild of this.client.guilds.cache.values()) {
                guild.commands.set([], guild.id);
            }
        }
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