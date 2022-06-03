const Command = require("../../base/Command");
const map = require("../../elements/map.js");
const alertQuest = require("../../structure/callbacks/AlertRequest");

class Give extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["give"],
            args: [],
            category: "Quêtes",
            cooldown: 5,
            description: "Commande permettant de donner des items aux personnages fictifs du jeu.",
            examples: ["give"],
            finishRequest: "ADVENTURE",
            name: "give",
            ownerOnly: false,
            permissions: 0,
            syntax: "give",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);
        const zone = loc.Areas.filter(a => a.id === mDatas.area)?.at(0);
        const qDatas = await this.client.questDb.get(this.message.author.id);

        const quests = {
            "region": [],
            "area": [],
        };

        for (const qKey of ["daily", "slayer", "world"]) {
            for (const q of qDatas[qKey].filter(quest => quest.objective.type === "give_k_items")) {
                if (q.objective.region === loc.id) {
                    if (q.objective.area === zone.id) {
                        quests.area.push([q, qKey]);
                    }
                    else {
                        quests.region.push([q, qKey]);
                    }
                }
            }
        }

        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        let questToGive = "";
        if (quests.region.length > 0) questToGive += `> **🌍 Quêtes de régions**\n\n${quests.region.map(q => q[0].display()).join("\n\n")}`;
        if (quests.area.length > 0) questToGive += `\n\n> **🗺️ Quêtes de zone**\n\n${quests.area.slice(0, 10).map((q, i) => `${emojis[i]}┆` + q[0].display()).join("\n\n")}${quests.area.length > 10 ? `\n...(${quests.area.length - 10} autres)` : ""}`;
        else questToGive += "\n\nVous n'avez aucune quête avec laquelle interagir.";

        const msg = await this.ctx.reply("Interaction: don d'objets", questToGive, null, null, "info");
        if (questToGive.endsWith("interagir.")) return;

        const choices = {};

        for (const i in emojis.slice(0, quests.area.length)) {
            choices[emojis[i]] = quests.area[i];
        }
        const reacts = Object.keys(choices);
        reacts.push("❌");
        const choice = await this.ctx.reactionCollection(msg, reacts);

        if (choice === "❌") {
            return await this.ctx.reply("Interaction: don d'objets", "Vous avez décidé de ne pas interagir.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Interaction: don d'objets", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }

        const q = choices[choice];
        const iDatas = await this.client.inventoryDb.get(this.message.author.id);

        const msg2 = await this.ctx.reply("Interaction: don d'objets", `Voulez-vous compléter l'objectif:\n${q[0].display()}`, null, null, "info");
        const choice2 = await this.ctx.reactionCollection(msg2, ["❌", "✅"]);

        if (choice2 === "❌") {
            return await this.ctx.reply("Interaction: don d'objets", "Vous avez décidé de ne pas interagir.", null, null, "info");
        }
        else if (choice2 === null) {
            return await this.ctx.reply("Interaction: don d'objets", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }
        else if (choice2 === "✅") {
            const hadBefore = q[0].objective.got;
            this.client.inventoryDb.db.ensure(this.message.author.id, this.client.inventoryDb.model(this.message.author.i));
            this.client.inventoryDb.db.ensure(this.message.author.id, 0, `${q[0].objective.itemCategory}.${q[0].objective.item}`);
            const itemQuantity = (await this.client.inventoryDb.get(this.message.author.id))[q[0].objective.itemCategory][q[0].objective.item];
            const toAdd = itemQuantity;
            const newAmount = hadBefore + toAdd;
            const newQuests = qDatas[q[1]].filter(dq => dq.id !== q[0].id);

            if (newAmount >= q[0].objective.quantity) {
                this.client.questDb.db.set(this.message.author.id, newQuests, q[1]);
                this.client.inventoryDb.db.math(this.message.author.id, "-", toAdd, `${q[0].objective.itemCategory}.${q[0].objective.item}`);
                this.client.inventoryDb.db.math(this.message.author.id, "+", q[0].objective.quantity - newAmount, `${q[0].objective.itemCategory}.${q[0].objective.item}`);
                await alertQuest(this.client, q[1], iDatas, q[0]);
            }
            else {
                const newQ = q[0];
                newQ.objective.got = newAmount;
                newQuests.push(newQ);
                this.client.inventoryDb.db.math(this.message.author.id, "-", toAdd, `${q[0].objective.itemCategory}.${q[0].objective.item}`);
                this.client.questDb.db.set(this.message.author.id, newQuests, q[1]);
            }
        }
    }
}

module.exports = new Give();