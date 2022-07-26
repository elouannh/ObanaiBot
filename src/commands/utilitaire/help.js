const { Collection } = require("discord.js");
const Command = require("../../base/Command");

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
const lower = {
    "Admin": "admin",
    "Combats": "battles",
    "Escouades": "squads",
    "Exploration": "exploration",
    "Owner": "owner",
    "Quêtes": "quests",
    "Stats": "statistics",
    "Testing": "testing",
    "Utilitaire": "utils",
};
const sections = {
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
            finishRequest: ["help"],
            name: "help",
            private: "none",
            permissions: 0n,
            syntax: "help <command>",
        });
    }

    async run() {
        const mainPageContent =
            `Bonjour. Je suis Obanai ! Mon préfixe sur ce serveur est \`${this.prefix}\`.\n`
            +
            "Si tu as besoin d'aide, mentionne-moi !\n\n"
            +
            "Voici quelques liens utiles:\n"
            +
            [
                ["Serveur support", "https://discord.gg/8GDpnYvRrC"],
                ["Inviter le bot", "https://discord.com/oauth2/authorize?client_id=958433246050406440&scope=bot&permissions=274878286912"],
                ["Twitter officiel", "https://twitter.com/ObanaiBot"],
                ["Twitter du développeur", "https://twitter.com/pxndxdev"],
                ["Chaîne YouTube", "https://www.youtube.com/channel/UC-6D-ACs0yTzngli2NBKYkg"],
                ["Le projet sur GitHub (open-source)", "https://github.com/PxndxDev/ObanaiDiscordBot"],
            ].map(e => `• [**${e[0]}**](${e[1]})`).join("\n")
            +
            "\n\nUtilisez les interactions ci-dessous pour trouver ce que vous cherchez !";

        const datas = {};
        for (const object of this.client.commandManager.commands.map(e => new e())) {
            const key = object.infos.category;
            const cache = {
                commands: datas[key]?.commands ?? [],
                "name": key,
                "emoji": emojis[key],
                "row": lower[key],
            };
            cache.commands.push(object);
            if (sections["Commandes du Personnel"].includes(cache.name)) {
                if (this.client.internalServerManager.staffs.includes(this.message.author.id)) {
                    datas[key] = cache;
                }
            }
            else {
                datas[key] = cache;
            }
        }

        const commandsPageContent = Object.values(datas).map(e => `${e.emoji} » **${e.name}** | \`${e.commands.length}\` commandes`).join("\n");

        let loop = true;
        let focus = "main";
        let exitMode = "timeout";

        const pages = [
            {
                react: "main",
                msgArgs: {
                    embeds: [
                        {
                            title: "Bonjour !",
                            description: mainPageContent,
                            emoji: "👋",
                            color: null,
                            style: "outline",
                        },
                    ],
                    components: [
                        "default",
                        "leave",
                    ],
                },
            },
            {
                react: "commands",
                msgArgs: {
                    embeds: [
                        {
                            title: "Liste des commandes.",
                            description: commandsPageContent,
                            emoji: "🍜",
                            color: null,
                            style: "outline",
                        },
                    ],
                    components: [
                        "commands_selector",
                        "default",
                        "search_command",
                        "leave",
                    ],
                },
            },
        ];

        for (const data of Object.values(datas)) {
            pages.push(
                {
                    react: `${data.row}_list`,
                    msgArgs: {
                        embeds: [
                            {
                                title: `Commandes | ${data.name}`,
                                description: data.commands.map(e => `**\`${e.infos.name}\`** : ${e.infos.description}`).join("\n"),
                                emoji: data.emoji,
                                color: null,
                                style: "outline",
                            },
                        ],
                        components: [
                            "commands_selector",
                            "default",
                            "search_command",
                            "leave",
                        ],
                    },
                },
            );
        }

        let req = null;


        while (loop) {
            const defaultsMenu = {
                "default": {
                    "type": "menu",
                    "components": [
                        {
                            "type": 3,
                            "customId": "main_menu",
                            "options": [
                                ["Page principale", "main", "Page principale du menu d'aide", "👋", focus === "main"],
                                ["Liste des commandes", "commands", "Liste de toutes les commandes du bot", "🍜", focus === "commands"],
                            ],
                            "placeholder": "Choisir une catégorie de commandes",
                            "minValues": 0,
                            "maxValues": 1,
                            "disabled": false,
                        },
                    ],
                },
                "leave": {
                    "type": "button",
                    "components": [
                        {
                            "style": "danger",
                            "label": "Quitter la navigation",
                            "customId": "leave",
                        },
                    ],
                },
                "commands_selector": {
                    "type": "menu",
                    "components": [
                        {
                            "type": 3,
                            "customId": "commands",
                            "options": Object.values(datas).map(e =>
                                [e.name, `${e.row}_list`, Object.entries(sections).filter(f => f[1].includes(e.name)).at(0).at(0), e.emoji, focus === `${e.row}_list`],
                            ),
                            "placeholder": "Changer de page",
                            "minValues": 0,
                            "maxValues": 1,
                            "disabled": false,
                        },
                    ],
                },
                "search_command": {
                    "type": "button",
                    "components": [
                        {
                            "style": "secondary",
                            "emoji": "🔎",
                            "label": "Chercher une commande",
                            "customId": "search_command",
                        },
                    ],
                },
            };
            const tempoReq = await this.ctx.superRequest(
                pages.filter(e => e.react === focus)?.at(0).msgArgs.embeds,
                pages.filter(e => e.react === focus)?.at(0).msgArgs.components
                    .map(e => Object.keys(defaultsMenu).includes(e) ? defaultsMenu[e] : e),
                null,
                req,
                true,
            );

            req = tempoReq;

            const res = await this.ctx.superResp(req);
            if (res === null) {
                loop = false;
            }
            else if (res.customId === "leave") {
                loop = false;
                exitMode = "leaved";
            }
            else if (res.componentType === 3) {
                focus = res.values[0];
            }
            else if (res.componentType === 2) {
                if (res.customId === "search_command") {}
            }
        }

        let errorMessage = "La navigation a été arrêtée car le temps est écoulé.";
        if (exitMode === "leaved") errorMessage = "Vous avez arrêtez la navigation.";

        await this.ctx.end(req);

        return await this.ctx.reply(
            "Navigation - Quêtes.",
            errorMessage,
            null,
            null,
            { "timeout": "timeout", "leaved": "success" }[exitMode],
        );

        // let cmd = this.client.commandManager.getCommand(this.args[0]);
        // if (this.args.length === 0 || cmd === 0) {
        //     const content = {};
        //     for (let command of this.client.commandManager.commands.map(e => e)) {
        //         command = new command();
        //         if (typeof content[command.infos.category] === "object") content[command.infos.category].push(command.infos);
        //         else content[command.infos.category] = [command.infos];
        //     }
        //     for (const dat in datas) {
        //         let string = dat === "Commandes Globales" ?
        //                      "Bienvenue sur la liste des commandes du bot ! Vous pouvez voir ci-dessous les différentes commandes rangées "
        //                      +
        //                      "par catégories.\n\nSi vous cherchez de l'aide pour une commande, faites la commande `help <command>`.\n\n"
        //                      +
        //                      "Vous pouvez également rejoindre [**le serveur support**](https://discord.gg/8GDpnYvRrC) en cliquant [**ici**](https://discord.gg/8GDpnYvRrC).\n\n"
        //                      : "";
        //         let commands = 0;
        //         for (const key of datas[dat]) {
        //             const cmds = Object.values(content[key] ?? {}).length;
        //             commands += cmds;
        //             string += `> **${emojis[key]} • ${key}** (**${cmds}** commandes)\nt`;
        //             if (dat === "Commandes du Personnel") {
        //                 if (key === "Testing" && this.client.internalServerManager.testers.includes(this.message.author.id)) {
        //                     string += `${Object.values(content[key] ?? {}).map(command => `\`${command.name}\``).join(" » ")}`;
        //                 }
        //                 else if (key === "Admin" && this.client.internalServerManager.admins.includes(this.message.author.id)) {
        //                     string += `${Object.values(content[key] ?? {}).map(command => `\`${command.name}\``).join(" » ")}`;
        //                 }
        //                 else if (key === "Owner" && this.client.internalServerManager.owners.includes(this.message.author.id)) {
        //                     string += `${Object.values(content[key] ?? {}).map(command => `\`${command.name}\``).join(" » ")}`;
        //                 }
        //                 else {
        //                     string += "Vous ne possédez pas les autorisations nécessaires pour voir ces commandes.";
        //                 }
        //             }
        //             else {
        //                 string += `${Object.values(content[key] ?? {}).map(command => `\`${command.name}\``).join(" » ")}`;
        //             }
        //             string += "\n\n";
        //         }
        //         const title = `${dat} (${commands})`;

        //         if (dat === "Commandes du Personnel" && !this.client.internalServerManager.staffs.includes(this.message.author.id)) {
        //             "que dalle";
        //         }
        //         else {
        //             await this.ctx.reply(title, string, null, null, "outline");
        //         }
        //     }
        // }
        // else if (cmd !== 0) {
        //     let string = "";
        //     cmd = new cmd();
        //     const i = cmd.infos;

        //     string += `\`${emojis[i.category]}\` **${i.category}** » ${i.description}\n`;
        //     string += `\`🏷️\` **Aliases**: ${i.aliases.map(e => `**\`${e}\`**`).join(" - ")}\n`;
        //     string += `\`⏰\` **Délai**: **\`${i.cooldown}\`** secondes\n`;
        //     string += `\`✏️\` **Syntaxe**: **\`${i.syntax}\`**\n`;
        //     string += `\`⚙️\` **Paramètres**:\n\`\`\`fix\n${i.args.length > 0 ? i.args.map((e, j) => `${j + 1}. ${e[0]}${e[2] === true ? "(⁕)" : ""} : ${e[1]}`).join("\n") : "- Aucun paramètre requis -"}\`\`\`\n`;
        //     string += `\`🖼️\` **Exemples**:\`\`\`fix\n${i.examples.map(e => `${e.replace("[p]", this.prefix)}`).join("\n")}\`\`\`\n`;
        //     const perms = new PermissionsBitField(i.permissions).toArray();
        //     string += `\`👘\` **Permissions**:\`\`\`fix\n${perms.length > 0 ? perms.join(" - ") : "- Aucune permission requise -"}\`\`\`\n\n`;

        //     return await this.ctx.reply(`t**Commande \`${i.name}\`**\n`, string, null, null, "outline");
        // }
    }
}

module.exports = Help;