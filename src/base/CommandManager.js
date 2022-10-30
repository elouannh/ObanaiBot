const {
    Collection,
    SlashCommandBuilder,
    SlashCommandUserOption,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
} = require("discord.js");
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
                if (new (command)().infos?.type !== undefined) {
                    this.commands.set(new (command)().infos.name, command);
                }
            }
        });

        const slashCommands = [];
        const contextCommands = [];

        this.commands.forEach(cmd => {
            if (new cmd().infos.type.includes(1)) {
                const build = new SlashCommandBuilder()
                    .setName(new cmd().infos.name)
                    .setDescription(new cmd().infos.description.substring(0, 100))
                    .setDescriptionLocalizations(new cmd().infos.descriptionLocalizations)
                    .setDMPermission(new cmd().infos.dmPermission);

                for (const option of new cmd().infos.options) {
                    if (option.type === 6) {
                        const userOption = new SlashCommandUserOption()
                            .setName(option.name)
                            .setNameLocalizations(option.nameLocalizations)
                            .setDescription(option.description)
                            .setDescriptionLocalizations(option.descriptionLocalizations)
                            .setRequired(option.required);

                        build.addUserOption(userOption);
                    }
                }

                slashCommands.push(build.toJSON());
            }
            if (new cmd().infos.type.includes(2)) {
                const build = new ContextMenuCommandBuilder()
                    .setName(this.client.util.capitalize(new cmd().infos.name))
                    .setType(ApplicationCommandType.User);

                contextCommands.push(build.toJSON());
            }
        });

        if (this.client.env.REGISTER_SLASH === "1") {
            void this.client.application.commands.set(slashCommands.concat(contextCommands));
            for (const guild of this.client.guilds.cache.values()) {
                void guild.commands.set([], guild.id);
            }
        }
    }

    getCommand(name) {
        if (this.commands.has(name)) { return this.commands.get(name); }
        else {
            return 0;
        }
    }

    async isOverloaded() {
        return this.client.requestsManager.totalSize >= this.client.maxRequests;
    }
}

module.exports = CommandManager;