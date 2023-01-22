const {
    Collection,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    SlashCommandUserOption,
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
                    this.commands.set(new (command)().slashBuilder.name, command);
                }
            }
        });

        const slashCommands = [];
        const contextCommands = [];

        this.commands.forEach(cmd => {
            cmd = new cmd();
            if (cmd.infos.type.includes(1)) {
                if (cmd.slashBuilder.description.length > 100) {
                    cmd.slashBuilder.description = cmd.slashBuilder.description.slice(0, 97) + "...";
                }
                for (const key in cmd.slashBuilder.descriptionLocalizations) {
                    if (cmd.slashBuilder.descriptionLocalizations[key].length > 100) {
                        cmd.slashBuilder.descriptionLocalizations[key] = cmd.slashBuilder.descriptionLocalizations[key]
                            .slice(0, 97) + "...";
                    }
                }

                const build = new SlashCommandBuilder()
                    .setName(cmd.slashBuilder.name)
                    .setDescription(cmd.slashBuilder.description)
                    .setDescriptionLocalizations(cmd.slashBuilder.descriptionLocalizations)
                    .setDMPermission(cmd.slashBuilder.dmPermission);

                for (const option of cmd.slashBuilder.options) {
                    if (option.description.length > 100) {
                        option.description = option.description.slice(0, 97) + "...";
                    }
                    for (const key in option.descriptionLocalizations) {
                        if (option.descriptionLocalizations[key].length > 100) {
                            option.descriptionLocalizations[key] = option.descriptionLocalizations[key]
                                .slice(0, 97) + "...";
                        }
                    }
                    if (option.type === 6) {
                        const userOption = new SlashCommandUserOption()
                            .setName(option.name)
                            .setDescription(option.description)
                            .setDescriptionLocalizations(option.descriptionLocalizations)
                            .setRequired(option.required);

                        if (option.nameLocalizations) userOption.setNameLocalizations(option.nameLocalizations);

                        build.addUserOption(userOption);
                    }
                }

                slashCommands.push(build.toJSON());
            }
            if (cmd.infos.type.includes(2)) {
                const build = new ContextMenuCommandBuilder()
                    .setName(cmd.contextBuilder.name)
                    .setType(ApplicationCommandType.User);

                contextCommands.push(build.toJSON());
            }
        });

        if (this.client.env.REGISTER_SLASH === "1") {
            this.client.util.timelog("Registering slash commands...", "yellow");
            this.client.envUpdate("REGISTER_SLASH", "0");
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