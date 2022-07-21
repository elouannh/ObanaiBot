const Command = require("../../base/Command");
const MapDbCallback = require("../../structure/callbacks/MapDbCallback");

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
        const pages = [
            {
                react: "slayer",
                msgArgs: {
                    embeds: [
                        {
                            title: "Quêtes de pourfendeur",
                            description: qDatas.slayer.length > 0 ? qDatas.slayer.map(e => e.display()).join("\n") : "Aucune quête active.",
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
                            description: qDatas.daily.length > 0 ? qDatas.daily.map(e => e.display()).join("\n") : "Aucune quête active.",
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
            console.log(res);
            if (res === null || res.customId === "leave") {
                loop = false;
            }
            else if (res.customId === "main_menu") {
                focus = res.values[0];
            }
        }

        return await this.ctx.reply("Navigation - Quêtes.", "La navigation a été quittée.", null, null, "timeout");
    }
}

module.exports = Testing;