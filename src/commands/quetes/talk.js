const Command = require("../../base/Command");
const map = require("../../elements/map.js");
const alertQuest = require("../../structure/callbacks/AlertRequest");

class Talk extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["talk"],
            args: [],
            category: "Quêtes",
            cooldown: 10,
            description: "Commande permettant de parler aux personnages fictifs du jeu.",
            examples: ["[p]talk"],
            finishRequest: "ADVENTURE",
            name: "talk",
            ownerOnly: false,
            permissions: 0,
            syntax: "talk",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);
        const area = loc.Areas.filter(a => a.id === mDatas.area)?.at(0);
        const qDatas = await this.client.questDb.get(this.message.author.id);

        const quests = {
            "region": [],
            "area": [],
        };

        for (const qKey of ["daily", "slayer", "world"]) {
            for (const q of qDatas[qKey].filter(quest => quest.objective.type === "talk")) {
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

        let questToTalk = "";
        if (quests.region.length > 0) questToTalk += `> **🌍 Quêtes de régions**\n\n${quests.region.map(q => q[0].display()).join("\n\n")}`;
        if (quests.area.length > 0) {
            questToTalk += `\n\n> **🗺️ Quêtes de zone**\n\n${
                quests.area.slice(0, 10).map((q, i) => `**${i + 1}.**┆` + q[0].display()).join("\n\n")}${quests.area.length > 10 ? `\n...(${quests.area.length - 10} autres)` : ""
            }`;
        }
        else {
            questToTalk += "\n\nVous n'avez aucune quête avec laquelle interagir.";
        }

        if (!questToTalk.endsWith("interagir.")) {
            questToTalk += "\n\n\n\nLorsque vous répondrez à ce message, vous entamerez le dialogue avec le personnage..";
            questToTalk += "\n\nRépondre avec le numéro correspondant à votre choix de quête.";
            questToTalk += "Répondre `n` (non) pour annuler.";
        }

        const msg = await this.ctx.reply("Interaction: dialoguer avec un personnage.", questToTalk, "🧩", null, "outline");
        if (questToTalk.endsWith("interagir.")) return;

        const choices = {};

        for (const i in quests.area) {
            choices[String(Number(i) + 1)] = quests.area[i];
        }

        const choice = await this.ctx.messageCollection(msg);

        if (Object.keys(choices).includes(choice)) {
            const q = choices[choice];
            await this.ctx.reply("Interaction: dialoguer avec un personnage.", q[0].objective.text, "💭", null, "info");
            const newQuests = qDatas[q[1]].filter(dq => dq.id !== q[0].id);
            const newValue = await this.client.questDb.get(this.message.author.id);

            this.client.questDb.db.set(this.message.author.id, newQuests, q[1]);
            await alertQuest(this.client, q[1], newValue, q[0]);
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Interaction: dialoguer avec un personnage.", "Vous avez décidé de ne pas interagir.", "🧩", null, "outline");
        }
        else {
            return await this.ctx.reply("Interaction: dialoguer avec un personnage.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = Talk;