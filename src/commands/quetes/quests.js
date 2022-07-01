const Command = require("../../base/Command");

class Quests extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["quests", "q"],
            args: [],
            category: "Quêtes",
            cooldown: 5,
            description: "Commande qui permet de voir la liste de toutes les quêtes.",
            examples: ["quests"],
            finishRequest: "ADVENTURE",
            name: "quests",
            ownerOnly: false,
            permissions: 0,
            syntax: "quests",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

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
                console.log(q);
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

module.exports = new Quests();