const Command = require("../../base/Command");
const { PermissionsBitField } = require("discord.js");

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

class Help extends Command {
    constructor() {
        super({
            aliases: ["help"],
            args: [["command", "nom de la commande.", false]],
            category: "Utilitaire",
            cooldown: 0,
            description: "Commande permettant de voir la liste des autres commandes, ou d'obtenir des informations précises sur l'une d'entre elles.",
            examples: ["[p]help", "[p]help prefix"],
            finishRequest: [],
            name: "help",
            private: "none",
            permissions: 0n,
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

            string += `\`${emojis[i.category]}\` **${i.category}** » ${i.description}\n`;
            string += `\`🏷️\` **Aliases**: ${i.aliases.map(e => `**\`${e}\`**`).join(" - ")}\n`;
            string += `\`⏰\` **Délai**: **\`${i.cooldown}\`** secondes\n`;
            string += `\`✏️\` **Syntaxe**: **\`${i.syntax}\`**\n`;
            string += `\`⚙️\` **Paramètres**:\n\`\`\`fix\n${i.args.length > 0 ? i.args.map((e, j) => `${j + 1}. ${e[0]}${e[2] === true ? "(⁕)" : ""} : ${e[1]}`).join("\n") : "- Aucun paramètre requis -"}\`\`\`\n`;
            string += `\`🖼️\` **Exemples**:\`\`\`fix\n${i.examples.map(e => `${e.replace("[p]", this.prefix)}`).join("\n")}\`\`\`\n`;
            const perms = new PermissionsBitField(i.permissions).toArray();
            string += `\`👘\` **Permissions**:\`\`\`fix\n${perms.length > 0 ? perms.join(" - ") : "- Aucune permission requise -"}\`\`\`\n\n`;

            return await this.ctx.reply(`t**Commande \`${i.name}\`**\n`, string, null, null, "outline");
        }
    }
}

module.exports = Help;