const Command = require("../../base/Command");

class Help extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["help", "aide"],
            args: [["command", "nom de la commande", false]],
            category: "Utilitaire",
            cooldown: 0,
            description: "Commande permet de voir la liste des autres commandes.",
            examples: ["help", "help prefix"],
            finishRequest: [],
            name: "help",
            ownerOnly: false,
            permissions: 0,
            syntax: "help <command>",
        });
    }

    async run() {
        const cmd = this.client.commandManager.getCommand(this.args[0]);
        if (this.args.length === 0 || cmd === 0) {
            const content = {};
            for (const command of this.client.commandManager.commands.map(e => e)) {
                if (typeof content[command.infos.category] === "object") content[command.infos.category].push(command.infos);
                else content[command.infos.category] = [command.infos];
            }
            const emojis = {
                "Administrateur": "⚠️",
                "Escouades": "⛩️",
                "Exploration": "🗺️",
                "Quêtes": "❗",
                "Stats": "🎒",
                "Utilitaire": "📣",
            };
            const datas = {
                "Commandes Globales": ["Administrateur", "Utilitaire"],
                "Commandes du RPG Demon Slayer": ["Escouades", "Exploration", "Quêtes", "Stats"],
            };
            for (const dat in datas) {
                let string = dat === "Commandes Globales" ?
                             "Bienvenue sur la liste des commandes du bot ! Vous pouvez voir ci-dessous les différentes commandes rangées "
                             +
                             "par catégories.\n\nSi vous cherchez de l'aide pour une commande, faites la commande `help <command>`.\n\n"
                             +
                             "Vous pouvez également rejoindre [**le serveur support**](https://discord.gg/8GDpnYvRrC) en cliquant [**ici**](https://discord.gg/8GDpnYvRrC).\n\n"
                             : "";
                let commands = 0;
                for (const key of datas[dat]) {
                    const cmds = Object.values(content[key]).length;
                    commands += cmds;
                    string += `> **${emojis[key]} • ${key}** (**${cmds}** commandes)\nt`;
                    if (key === "Administrateur" && !this.client.config.owners.includes(this.message.author.id)) {
                        string += "*Cette catégorie de commande est réservée.*";
                    }
                    else {
                        string += `${Object.values(content[key]).map(command => `\`${command.syntax}\` : ${command.description}`).join("\n")}`;
                    }
                    string += "\n\n";
                }
                const title = `${dat} (${commands})`;

                await this.ctx.reply(title, string, null, null, "outline");
            }
        }
        else if (cmd !== 0) {
            let string = "";
            const i = cmd.infos;
            string += `*${i.description}*\n\ntSyntaxe: \`${i.syntax}\` | Aliases: \`${i.aliases.join(", ")}\`\n`;
            if (i.args.length > 0) string += `\`\`\`diff\nArgs:\n${i.args.map(e => `- ${e[0]} : ${e[1]} | ${e[2] === true ? "Obligatoire" : "Optionnel"}`).join("\n")}\`\`\``;
            string += `\`\`\`diff\nExemples:\n${i.examples.map(e => `- ${e}`).join("\n")}\`\`\``;
            if (i.ownerOnly) string += "```fix\nCette commande n'est faisable que par le créateur du bot.```";
            else if (i.adminOnly) string += "```fix\nCette commande nécessite des autorisations particulières.```";
            string += "\n\n*Certaines informations de cette page ne peuvent pas être traduites.*";

            return await this.ctx.reply(`t**Commande \`${i.name}\`**\n`, string, null, null, "outline");
        }
    }
}

module.exports = new Help();