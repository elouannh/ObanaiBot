const Command = require("../../base/Command");

class Help extends Command {
    constructor() {
        super({
            aliases: ["help"],
            args: [["command", "nom de la commande.", false]],
            category: "Utilitaire",
            cooldown: 0,
            description: "Commande permet de voir la liste des autres commandes.",
            examples: ["[p]help", "[p]help prefix"],
            finishRequest: [],
            name: "help",
            private: "none",
            permissions: 0,
            syntax: "help <command>",
        });
    }

    async run() {
        let cmd = this.client.commandManager.getCommand(this.args[0]);
        if (this.args.length === 0 || cmd === 0) {
            const content = {};
            for (let command of this.client.commandManager.commands.map(e => e)) {
                command = new command();
                if (typeof content[command.infos.category] === "object") content[command.infos.category].push(command.infos);
                else content[command.infos.category] = [command.infos];
            }
            const emojis = {
                "Admin": "🚧",
                "Combats": "🏟️",
                "Escouades": "⛩️",
                "Exploration": "🗺️",
                "Owner": "👑",
                "Quêtes": "❗",
                "Stats": "🎒",
                "Testing": "🔨",
                "Utilitaire": "📣",
            };
            const datas = {
                "Commandes Globales": ["Utilitaire"],
                "Commandes du RPG Demon Slayer": ["Combats", "Escouades", "Exploration", "Quêtes", "Stats"],
                "Commandes du Personnel": ["Testing", "Admin", "Owner"],
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
                    const cmds = Object.values(content[key] ?? {}).length;
                    commands += cmds;
                    string += `> **${emojis[key]} • ${key}** (**${cmds}** commandes)\nt`;
                    if (dat === "Commandes du Personnel") {
                        if (key === "Testing" && this.client.internalServerManager.testers.includes(this.message.author.id)) {
                            string += `${Object.values(content[key] ?? {}).map(command => `\`${command.name}\``).join(" » ")}`;
                        }
                        else if (key === "Admin" && this.client.internalServerManager.admins.includes(this.message.author.id)) {
                            string += `${Object.values(content[key] ?? {}).map(command => `\`${command.name}\``).join(" » ")}`;
                        }
                        else if (key === "Owner" && this.client.internalServerManager.owners.includes(this.message.author.id)) {
                            string += `${Object.values(content[key] ?? {}).map(command => `\`${command.name}\``).join(" » ")}`;
                        }
                        else {
                            string += "Vous ne possédez pas les autorisations nécessaires pour voir ces commandes.";
                        }
                    }
                    else {
                        string += `${Object.values(content[key] ?? {}).map(command => `\`${command.name}\``).join(" » ")}`;
                    }
                    string += "\n\n";
                }
                const title = `${dat} (${commands})`;

                if (dat === "Commandes du Personnel" && !this.client.internalServerManager.staffs.includes(this.message.author.id)) {
                    "que dalle";
                }
                else {
                    await this.ctx.reply(title, string, null, null, "outline");
                }
            }
        }
        else if (cmd !== 0) {
            let string = "";
            cmd = new cmd();
            const i = cmd.infos;
            string += `*${i.description}*\n\ntSyntaxe: \`${i.syntax}\` | Aliases: \`${i.aliases.join(", ")}\`\n`;
            if (i.args.length > 0) string += `\`\`\`diff\nArgs:\n${i.args.map(e => `- ${e[0]} (${e[2] === true ? "Obligatoire" : "Optionnel"}): ${e[1]}`).join("\n")}\`\`\``;
            string += `\`\`\`diff\nExemples:\n${i.examples.map(e => `${e.replace("[p]", this.prefix)}`).join("\n")}\`\`\``;
            string += "\n\n*Certaines informations de cette page ne peuvent pas être traduites.*";

            return await this.ctx.reply(`t**Commande \`${i.name}\`**\n`, string, null, null, "outline");
        }
    }
}

module.exports = Help;