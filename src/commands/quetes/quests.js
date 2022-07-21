const Command = require("../../base/Command");
const MapDbCallback = require("../../structure/callbacks/MapDbCallback");

class Quests extends Command {
    constructor() {
        super({
            aliases: ["quests", "q"],
            args: [],
            category: "Quêtes",
            cooldown: 10,
            description: "Commande qui permet de voir la liste de toutes les quêtes.",
            examples: ["[p]quests"],
            finishRequest: "ADVENTURE",
            name: "quests",
            private: "none",
            permissions: 0n,
            syntax: "quests",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const fct = MapDbCallback(this.client);
        await fct(this.message.author.id, { region: -1, area: -1 }, mDatas);

        const qDatas = await this.client.questDb.get(this.message.author.id);

        let quests = "";

        if (qDatas.daily.length > 0) {
            quests += "> 📅 **Quêtes journalières**";
            for (const q of qDatas.daily) {
                quests += `\n\n${q.display()}`;
            }
        }

        if (qDatas.slayer.length > 0) {
            quests += `${quests.length > 1 ? "\n\n" : ""}> 🥋 **Quêtes de pourfendeur**`;
            for (const q of qDatas.slayer) {
                quests += `\n\n${q.display()}`;
            }
        }

        if (qDatas.world.length > 0) {
            quests += `${quests.length > 1 ? "\n\n" : ""}> 👒 **Quêtes du monde**`;
            for (const q of qDatas.world) {
                quests += `\n\n${q.display()}`;
            }
        }

        if (quests.length < 1) quests = "Vous n'avez aucune quête.";

        return await this.ctx.reply("Liste des quêtes", quests, "📜", null, "outline");
    }
}

module.exports = Quests;