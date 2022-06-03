const Command = require("../../base/Command");
const fs = require("fs");
const convertDate = require("../../utils/convertDate");

class Grimoire extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["grimoires-list", "grims-list", "gr-l"],
            args: [],
            category: "Stats",
            cooldown: 5,
            description: "Commande qui permet de voir la liste de tous les grimoires.",
            examples: ["grimoires-list"],
            finishRequest: "ADVENTURE",
            name: "grimoires-list",
            ownerOnly: false,
            permissions: 0,
            syntax: "grimoires-list",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const grims = fs.readdirSync("./src/elements/grimoires");
        const grims_boost = {
            "experience_gain": "+[b]%⭐",
            "yens_gain": "+[b]%💰",
            "kasugai_crows_rarity_boost": "+[b]%🐦 rareté",
            "lootbox_rate_boost": "+[b]%🧰 rareté",
            "stats_boost": "+[b]%👑 stats",
            "travelling_time": "-[b]%🕣 voyage",
            "training_time": "-[b]%🕣 entrainement",
        };

        let string = "";
        for (let grimoire of grims) {
            grimoire = require(`../../elements/grimoires/${grimoire}`);

            if (!grimoire.equippable) {
                string += `> **${grimoire.name}** | \`nom: ${grimoire.label}\``;
                string += "\nCe grimoire ne s'équipe pas, c'est un consommable.";
                string += "\n\n";
            }
            else {
                const timeLeft = (grimoire.expiration * 1000);
                string += `> **${grimoire.name}** | \`nom: ${grimoire.label}\``;
                string += `\nDurée de vie: **${convertDate(timeLeft, false).string}**`;
                string += `\nBénéfices:\n\`\`\`${grimoire.benefits.map(e => `- ${grims_boost[e].replace("[b]", ((grimoire.boost - 1) * 100).toFixed(0))}`).join("\n")}\`\`\``;
                string += "\n\n";
            }
        }

        return await this.ctx.reply("Liste des grimoires", string, null, null, "outline");
    }
}

module.exports = new Grimoire();