const Command = require("../../base/Command");
const map = require("../../elements/map.js");
const alertQuest = require("../../structure/callbacks/AlertRequest");

class Give extends Command {
    constructor() {
        super({
            aliases: ["give"],
            args: [],
            category: "Quêtes",
            cooldown: 10,
            description: "Commande permettant de donner des items aux personnages fictifs du jeu.",
            examples: ["[p]give"],
            finishRequest: "ADVENTURE",
            name: "give",
            private: "none",
            permissions: 0n,
            syntax: "give",
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
            "region": [],
            "area": [],
        };

        for (const qKey of ["daily", "slayer", "world"]) {
            for (const q of qDatas[qKey].filter(quest => quest.objective.type === "give_k_items")) {
                if (q.objective.region === loc.id) {
                    if (q.objective.area === area.id) {
                        quests.area.push([q, qKey]);
                    }
                    else {
                        quests.region.push([q, qKey]);
                    }
                }
            }
        }

        let questToGive = "";
        if (quests.region.length > 0) {
            questToGive += `> **🌍 Quêtes de régions**\n\n${quests.region.map(q => q[0].display()).join("\n\n")}`;
        }
        if (quests.area.length > 0) {
            questToGive += `\n\n> **🗺️ Quêtes de zone**\n\n${
                quests.area.slice(0, 10)
                            .map((q, i) => `**${i + 1}.**┆` + q[0].display())
                            .join("\n\n")}`
                +
                `${quests.area.length > 10 ? `\n...(${quests.area.length - 10} autres)` : ""}`;
        }
        else {
            questToGive += "\n\nVous n'avez aucune quête avec laquelle interagir.";
        }

        if (!questToGive.endsWith("interagir.")) {
            questToGive += "\n\n\n\nLorsque vous répondrez à ce message, ";
            questToGive += "vous donnerez automatiquement les ressources nécessaires si possible.";
            questToGive += "\n\nRépondre avec le numéro correspondant à votre choix de quête.";
            questToGive += "Répondre `n` (non) pour annuler.";
        }

        const msg = await this.ctx.reply("Interaction: don d'objets.", questToGive, "🧩", null, "outline");
        if (questToGive.endsWith("interagir.")) return;

        const choices = {};

        for (const i in quests.area) {
            choices[String(Number(i) + 1)] = quests.area[i];
        }

        const choice = await this.ctx.messageCollection(msg);

        if (Object.keys(choices).includes(choice)) {
            const q = choices[choice];
            const iDatas = await this.client.inventoryDb.get(this.message.author.id);

            const hadBefore = q[0].objective.got;
            this.client.inventoryDb.db.ensure(
                this.message.author.id,
                this.client.inventoryDb.model(this.message.author.i),
            );
            this.client.inventoryDb.db.ensure(
                this.message.author.id, 0,
                `${q[0].objective.itemCategory}.${q[0].objective.item}`,
            );
            const itemQuantity = (await this.client.inventoryDb.get(this.message.author.id))[
                                     q[0].objective.itemCategory
                                 ][
                                     q[0].objective.item
                                 ];
            const toAdd = itemQuantity;
            const newAmount = hadBefore + toAdd;
            const newQuests = qDatas[q[1]].filter(dq => dq.id !== q[0].id);

            if (newAmount >= q[0].objective.quantity) {
                this.client.questDb.db.set(this.message.author.id, newQuests, q[1]);
                this.client.inventoryDb.db.math(
                    this.message.author.id,
                    "-",
                    toAdd,
                    `${q[0].objective.itemCategory}.${q[0].objective.item}`,
                );
                this.client.inventoryDb.db.math(
                    this.message.author.id,
                    "+",
                    q[0].objective.quantity - newAmount,
                    `${q[0].objective.itemCategory}.${q[0].objective.item}`,
                );
                await alertQuest(this.client, q[1], iDatas, q[0]);
            }
            else {
                const newQ = q[0];
                newQ.objective.got = newAmount;
                newQuests.push(newQ);
                this.client.inventoryDb.db.math(
                    this.message.author.id,
                    "-",
                    toAdd,
                    `${q[0].objective.itemCategory}.${q[0].objective.item}`,
                );
                this.client.questDb.db.set(this.message.author.id, newQuests, q[1]);
            }
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply(
                "Interaction: don d'objets.",
                "Vous avez décidé de ne pas interagir.",
                "🧩",
                null,
                "outline",
            );
        }
        else {
            return await this.ctx.reply(
                "Interaction: don d'objets.",
                "La commande n'a pas aboutie.",
                null,
                null,
                "timeout",
            );
        }
    }
}

module.exports = Give;