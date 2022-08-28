const Command = require("../../base/Command");
const map = require("../../elements/map.js");
const alertQuest = require("../../base/database/callbacks/AlertRequest");

class Inspect extends Command {
    constructor() {
        super({
            category: "Quêtes",
            cooldown: 10,
            description: "Commande permettant d'inspecter là où vous vous trouver.",
            finishRequest: "ADVENTURE",
            name: "inspect",
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) {
            return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");
        }

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);
        const area = loc.Areas.filter(a => a.id === mDatas.area)?.at(0);
        const qDatas = await this.client.questDb.get(this.message.author.id);

        const quests = {
            "area": [],
        };

        for (const qKey of ["daily", "slayer", "world"]) {
            for (const q of qDatas[qKey].filter(quest => quest.objective.type === "inspect_area")) {
                if (q.objective.region === loc.id) {
                    if (q.objective.area === area.id) quests.area.push([q, qKey]);
                }
            }
        }

        let questToTalk = "";
        if (quests.area.length > 0) {
            questToTalk += `\n\n> **🗺️ Quêtes de zone qui vont être inspectées**\n\n${
                quests.area.slice(0, 10).map(q => `${
                    {
                        "daily": "Quêtes quotidiennes.",
                        "slayer": "Quêtes de pourfendeur.",
                        "world": "Quêtes de monde.",
                    }[q[1]]} ┆ ${q[0].title}`).join("\n")
                }${quests.area.length > 10 ? `\n\n...(${quests.area.length - 10} autres)` : ""
            }`;
        }
        else {
            questToTalk += "\n\nVous n'avez aucune quête avec laquelle interagir.";
        }

        await this.ctx.reply("Interaction: inspecter la zone.", questToTalk, "🧩", null, "outline");
        if (questToTalk.endsWith("interagir.")) return;

        const added = {
            "materials": {},
            "questItems": {},
        };

        for (const qKey of ["daily", "slayer", "world"]) {
            for (const q of quests.area.filter(e => e[1] === qKey)) {
                const iDatas = await this.client.inventoryDb.get(this.message.author.id);

                const mat1 = q[0].objective.itemCategory in iDatas ?
                            (
                                q[0].objective.item in iDatas[q[0].objective.itemCategory] ?
                                iDatas[q[0].objective.itemCategory][q[0].objective.item]
                                : 0
                            )
                            : 0;
                const mat2 = q[0].objective.itemCategory in added ?
                            (
                                q[0].objective.item in added[q[0].objective.itemCategory] ?
                                added[q[0].objective.itemCategory][q[0].objective.item]
                                : 0
                            )
                            : 0;

                this.client.inventoryDb.db.set(
                    this.message.author.id,
                    q[0].objective.quantity + mat1,
                    `${q[0].objective.itemCategory}.${q[0].objective.item}`,
                );
                added[q[0].objective.itemCategory][q[0].objective.item] = mat2 + q[0].objective.quantity;

                const newValue = await this.client.questDb.get(this.message.author.id);
                const newQuests = qDatas[qKey].filter(Q => Q.id !== q[0].id);

                this.client.questDb.db.set(this.message.author.id, newQuests, q[1]);
                await alertQuest(this.client, q[1], newValue, q[0]);
            }
        }

        return await this.ctx.reply(
            "Interaction: inspecter la zone.",
            `${Object.values(added.materials).length > 0 ?
                "**»** Vous avez obtenu des matériaux, regardez votre inventaire !\n\n"
                : ""
            }`
            +
            `${Object.values(added.materials).length > 0 ? "**»** Vous avez obtenu des objets de quête !" : ""}`,
            "🧩",
            null,
            "outline",
        );

    }
}

module.exports = Inspect;