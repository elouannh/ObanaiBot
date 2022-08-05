const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, Status, ButtonBuilder, escapeMarkdown } = require("discord.js");
const Nav = require("../../base/NavigationClasses");

class Testing extends Command {
    constructor() {
        super({
            category: "Testing",
            cooldown: 7,
            description: "Commande permettant de tester une fonctionnalité.",
            finishRequest: ["Testing"],
            name: "testing",
            private: "testing",
            permissions: 0n,
        });
    }

    async run() {
        const userGrade = this.client.internalServerManager.userRank(this.interaction.user.id);
        const internalServer = await this.client.internalServerManager;
        const statusDb = await this.client.statusDb;

        const processus = {
            "server1": internalServer.processing[0]
                .filter(e => e === true).length * 100 / internalServer.processing[0].length,
            "server2": internalServer.processing[1]
                .filter(e => e === true).length * 100 / internalServer.processing[1].length,
        };
        const ready = {
            "server1": { "0": "🔴 offline", "1": "🟡 preparing", "2": "🟢 online" }[internalServer.readyOrNot[0]],
            "server2": { "0": "🔴 offline", "1": "🟡 preparing", "2": "🟢 online" }[internalServer.readyOrNot[1]],
        };

        function processStrings(percent) {
            const identifiers = {
                "0": "🟣 <10%",
                "10": "🔵 <25%",
                "25": "🟢 <50%",
                "50": "🟡 <60%",
                "60": "🟠 <80%",
                "80": "🔴 >80%",
            };

            return Object.entries(identifiers).filter(e => percent >= Number(e[0])).at(-1)[1];
        }

        function statusString(name) {
            const identifiers = {
                "online": "🟢 online",
                "disabled": "🔴 unavailable",
                "maintenance": "🟡 maintenance",
            };

            return identifiers[name];
        }

        function pingString(amount) {
            const identifiers = {
                "50": "🟣",
                "100": "🔵",
                "150": "🟢",
                "200": "🟡",
                "400": "🟠",
                "600": "🔴",
            };

            return Object.entries(identifiers).filter(e => amount >= Number(e[0])).at(-1)[1] + ` ${amount} ms`;
        }

        // DISCORD API STATUS
        let datas = "> 🔨 ***Discord API***\n\n";
        datas += `\`ping\`: **\`${pingString(this.client.ws.ping)}\`**\n`;
        datas += `\`api status\`: **\`${Status[this.client.ws.status]}\`**\n\n`;

        // INTERNAL SERVER STATUS
        datas += "> ⚗️ ***Obanai's Internal Server***\n\n";
        datas += "**Server 1 [launcher]**\n";
        datas += `\`status\`: **\`${ready["server1"]}\`**\n`;
        datas += `\`process\`: **\`${processStrings(processus["server1"])}\`**\n`;

        datas += "**Server 2 [sync_p2p]**\n";
        datas += `\`status\`: **\`${ready["server2"]}\`**\n`;
        datas += `\`process\`: **\`${processStrings(processus["server2"])}\`**\n\n`;

        // RPG STATUS
        datas += "> 🌍 ***Obanai's RPG Server***\n\n";
        datas += `\`status\`: **\`${statusString(statusDb.datas.mode)}\`**\n`;
        datas += "**Process**\n";
        const memoryUsage = process.memoryUsage().heapTotal / 1024 / 1024;
        const ramPercent = Math.ceil(memoryUsage * 100 / (4.00 * 1024));
        datas += `\`memory usage\`: **\`${((memoryUsage).toFixed(4))} MB\`**/\`${(4.00 * 1024).toFixed(0)} MB\``;
        datas += `\`(${ramPercent}%)\`\n`;
        datas += `\`process\`: **\`${processStrings(this.client.requestsManager.totalSize * 100 / this.client.maxRequests)}\`**\n`;
        datas += `\`uptime\`: **\`${this.client.util.convertDate(process.uptime() * 1000, true).string}\`**`;

        let botinfos = "> 📦 ***Databases sizes***\n\n";
        botinfos += `\`players\`: **\`${
            this.client.playerDb.db.array().filter(e => e.started === true).length
        } entries\`**\n`;
        botinfos += `\`users\`: **\`${this.client.users.cache.size} entries\`**\n`;
        botinfos += `\`servers\`: **\`${this.client.guilds.cache.size} entries\`**\n\n`;

        botinfos += "> ❗ ***Last entries***\n\n";
        botinfos += `**Last 5 Servers**\n${
            this.client.guilds.cache
                .map(e => [e.name, e.joinedTimestamp])
                .sort((a, b) => b[1] - a[1])
                .splice(0, 5)
                .map(e => `**\`${e[0]}\` - <t:${((e[1]) / 1000).toFixed(0)}:R>**`)
                .join("\n")
        }\n`;
        botinfos += `\n**Last 5 Players**\n${
            this.client.playerDb.db.array()
                .filter(e => e.started === true)
                .sort((a, b) => b.created - a.created)
                .splice(0, 5)
                .map(e => `**\`${
                    escapeMarkdown(this.client.users.cache.get(e.id)?.username ?? "non-cached player")
                }\` - <t:${((e.created) / 1000).toFixed(0)}:R>**`)
                .join("\n")
        }\n`;

        const pages = {
            "testing_panel": new Nav.Panel()
                .setIdentifier(
                    new Nav.Identifier()
                        .setLabel("Panel de testing")
                        .setValue("testing_panel")
                )
                .setPages([
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel("Informations utilisateur")
                                .setValue("user_informations")
                                .setDescription("Informations relatives à l'utilisateur faisant la commande.")
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("Panel Administrateur - Informations")
                                .setDescription(`**Grades:** ${userGrade.allGrades.filter(g => g.length > 1).join(", ")}`),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel("Statut du bot")
                                .setValue("bot_status")
                                .setDescription("Statut du bot ainsi que les processus en cours.")
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("Panel Administrateur - Statut du bot")
                                .setDescription(`${datas}`),
                        ]),
                    new Nav.Page()
                        .setIdentifier(
                            new Nav.Identifier()
                                .setLabel("Informations du bot")
                                .setValue("bot_infos")
                                .setDescription("Informations du bot ainsi que certaines données.")
                        )
                        .setEmbeds([
                            new EmbedBuilder()
                                .setTitle("Panel Administrateur - Statut du bot")
                                .setDescription(`${botinfos}`),
                        ]),
                ])
                .setComponents([
                    new ActionRowBuilder()
                        .setComponents(
                            new SelectMenuBuilder()
                                .setCustomId("testing_panel")
                                .setPlaceholder("Choisir la page du panel de testing")
                                .setOptions([
                                    {
                                        value: "user_informations",
                                        label: "Informations utilisateur",
                                        description: "Informations relatives à l'utilisateur faisant la commande.",
                                    },
                                    {
                                        value: "bot_status",
                                        label: "Statut du bot",
                                        description: "Statut du bot ainsi que les processus en cours.",
                                    },
                                    {
                                        value: "bot_infos",
                                        label: "Informations du bot",
                                        description: "Informations du bot ainsi que certaines données.",
                                    },
                                ]),
                        ),
                ]),
        };

        const universalRows = [
                new ActionRowBuilder()
                    .setComponents(
                        new SelectMenuBuilder()
                            .setCustomId("panel_category_selector")
                            .setPlaceholder("Choisir la catégorie de panel")
                            .setOptions(Object.values(pages).map(option => option.identifier)),
                    ),
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder()
                            .setCustomId("leave_panel")
                            .setLabel("Quitter le panel")
                            .setStyle("Danger"),
                    ),
        ];

        const panel = await this.interaction.reply({
            embeds: pages.testing_panel.pages[0].embeds,
            components: pages.testing_panel.components.concat(universalRows),
        }).catch(() => null);
        const navigation = panel.createMessageComponentCollector({
            filter: inter => inter.user.id === this.interaction.user.id,
            time: 120_000,
            idle: 30_000,
            dispose: true,
        });

        let currentPanel = "testing_panel";

        navigation.on("collect", async inter => {
            if (inter.isSelectMenu()) {
                if (inter.customId === "panel_category_selector") {
                    currentPanel = inter.values[0];

                    const newComponents = pages[currentPanel].pages[0].components;
                    for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                    for (const universalRow of universalRows) newComponents.push(universalRow);

                    panel.interaction.editReply({
                        embeds: pages[currentPanel].pages[0].embeds,
                        components: newComponents,
                    }).catch(() => null);
                }
                else if (Object.keys(pages).includes(inter.customId)) {
                    const newComponents = pages[currentPanel].pages.find(p => p.identifier.value === inter.values[0]).components;
                    for (const pageRow of pages[currentPanel].components) newComponents.push(pageRow);
                    for (const universalRow of universalRows) newComponents.push(universalRow);

                    panel.interaction.editReply({
                        embeds: pages[currentPanel].pages.find(p => p.identifier.value === inter.values[0]).embeds,
                        components: pages[currentPanel].components.concat(universalRows),
                    }).catch(() => null);
                }
                await inter.deferUpdate()
                    .catch(() => null);
            }
            else if (inter.isButton()) {
                if (inter.customId === "leave_panel") {
                    panel.interaction.editReply({ embeds: panel.embeds, components: [] })
                        .catch(() => null);
                    await inter.deferUpdate()
                        .catch(() => null);
                    navigation.stop();
                }
            }
        });
    }
}

module.exports = Testing;