const Command = require("../../base/Command");
const MapDbCallback = require("../../structure/callbacks/MapDbCallback");
const storyDatas = require("../../elements/storyDatas.json");
const fs = require("fs");

class Testing extends Command {
    constructor() {
        super({
            aliases: ["testing"],
            args: [],
            category: "Testing",
            cooldown: 7,
            description: "Commande permettant de tester une fonctionnalité.",
            examples: ["[p]testing"],
            finishRequest: ["Testing"],
            name: "testing",
            private: "testers",
            permissions: 0n,
            syntax: "testing",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const fct = MapDbCallback(this.client);
        await fct(this.message.author.id, { region: -1, area: -1 }, mDatas);

        const qDatas = await this.client.questDb.get(this.message.author.id);
        let sp = qDatas.storyProgress;
        // ---------------------------------------------------------------
        const questSuit = [];
        for (const folder of fs.readdirSync("./src/quests/slayer/")) {
            for (const file of fs.readdirSync(`./src/quests/slayer/${folder}/`).map(e => e.replace(".js", ""))) {
                questSuit.push(`${folder.replace("chapter", "")}_${file.replace("quest", "")}`);
            }
        }
        const advancement = `${sp.chapter}_${sp.quest}`;
        const nextQuest = questSuit[questSuit.indexOf(advancement) + 1];
        const probablyTheSame = questSuit[questSuit.indexOf(advancement)];

        if (nextQuest !== undefined) {
            const cs = [`${sp.chapter}`, `${nextQuest.split("_")[0]}`];
            const qs = [`${sp.quest}`, `${nextQuest.split("_")[1]}`];
            const sameQuest = (cs[0] === cs[1]) && (qs[0] === qs[1]);
            const quest = require(`../../quests/slayer/chapter${nextQuest.split("_")[0]}/quest${nextQuest.split("_")[1]}.js`)(sameQuest === true ? sp.step : 0);
            if (quest !== true) sp = { chapter: Number(cs[0]), quest: Number(qs[0]), step: sameQuest === true ? sp.step : 0 };
        }
        else {
            const cs = [`${sp.chapter}`, `${probablyTheSame.split("_")[0]}`];
            const qs = [`${sp.quest}`, `${probablyTheSame.split("_")[1]}`];
            const sameQuest = (cs[0] === cs[1]) && (qs[0] === qs[1]);

            if (sameQuest) {
                const quest = require(`../../quests/slayer/chapter${probablyTheSame.split("_")[0]}/quest${probablyTheSame.split("_")[1]}.js`)(sameQuest === true ? sp.step + 1 : 0);
                if (quest !== true) sp = { chapter: Number(cs[0]), quest: Number(qs[0]), step: sameQuest === true ? sp.step + 1 : 0 };
            }
        }

        // ---------------------------------------------------------------

        const sd = storyDatas[`chapter${sp.chapter}`];
        const sq = sd.quests[sp.quest - 1];

        const slayerQuestsStr =
            `**Obanai, l'héritage d'Ichi** - Chapitre **${sp.chapter}**, **${sd.name}**\n`
            +
            `> *« ${sd.description} »*\n\n`
            +
            `> [**Quête \`${sp.quest}\`** » ${sq.name}](${sq.link}) • partie **${sp.step + 1}**:\n`
            +
            `\n${qDatas.slayer.length > 0 ?
                qDatas.slayer.map(e => e.display()).join("\n")
                : "La suite du mode histoire n'est pas encore disponible."}`;

        const lastRefresh = this.client.internalServerManager.datas.dailyQuests.lastRefresh;
        const dailyQuestsStr =
            `**Nouvelles quêtes:** <t:${((lastRefresh + 86_400_000) / 1000).toFixed(0)}:R>\n\n`
            +
            `${qDatas.daily.length > 0 ?
                qDatas.daily.map(e => e.display()).join("\n\n")
                : "Vous n'avez aucune quête pour le moment."}`;

        const pages = [
            {
                react: "slayer",
                msgArgs: {
                    embeds: [
                        {
                            title: "Quêtes de pourfendeur",
                            description: slayerQuestsStr,
                            emoji: "👺",
                            color: null,
                            style: "outline",
                        },
                    ],
                },
            },
            {
                react: "daily",
                msgArgs: {
                    embeds: [
                        {
                            title: "Quêtes quotidiennes",
                            description: dailyQuestsStr,
                            emoji: "🗓️",
                            color: null,
                            style: "outline",
                        },
                    ],
                },
            },
            {
                react: "world",
                msgArgs: {
                    embeds: [
                        {
                            title: "Quêtes de monde",
                            description: qDatas.world.length > 0 ? qDatas.world.map(e => e.display()).join("\n") : "Aucune quête active.",
                            emoji: "🌍",
                            color: null,
                            style: "outline",
                        },
                    ],
                },
            },
        ];

        let loop = true;
        let focus = "slayer";
        let exitMode = "timeout";

        let req = null;

        while (loop) {
            const tempoReq = await this.ctx.superRequest(
                pages.filter(e => e.react === focus)?.at(0).msgArgs.embeds,
                [
                    {
                        "type": "menu",
                        "components": [
                            {
                                "type": 3,
                                "customId": "main_menu",
                                "options": [
                                    ["Quêtes de pourfendeur", "slayer", "Quêtes liées au mode histoire.", "👺", focus === "slayer"],
                                    ["Quêtes journalières", "daily", "Quêtes liées au mode histoire.", "🗓️", focus === "daily"],
                                    ["Quêtes du monde", "world", "Quêtes liées au mode histoire.", "🌍", focus === "world"],
                                ],
                                "placeholder": "Voir vos autres quêtes",
                                "minValues": 0,
                                "maxValues": 1,
                                "disabled": false,
                            },
                        ],
                    },
                    {
                        "type": "button",
                        "components": [
                            {
                                "style": "danger",
                                "label": "Quitter la navigation",
                                "customId": "leave",
                            },
                        ],
                    },
                ],
                null,
                req,
                true,
            );

            req = tempoReq;

            const res = await this.ctx.superResp(req);
            if (res === null) {
                loop = false;
            }
            else if (res.customId === "main_menu") {
                focus = res.values[0];
            }
            else if (res.customId === "leave") {
                loop = false;
                exitMode = "leaved";
            }
        }

        let errorMessage = "La navigation a été arrêtée car le temps est écoulé.";
        if (exitMode === "leaved") errorMessage = "Vous avez arrêtez la navigation.";

        return await this.ctx.reply(
            "Navigation - Quêtes.",
            errorMessage,
            null,
            null,
            { "timeout": "timeout", "leaved": "success" }[exitMode],
        );
    }
}

module.exports = Testing;