const Command = require("../../base/Command");

class GrimoireSet extends Command {
    constructor() {
        super({
            aliases: ["grimoire-set", "gs"],
            args: [],
            category: "Stats",
            cooldown: 15,
            description: "Commande permettant d'équiper un grimoire.",
            examples: ["[p]grimoire-set"],
            finishRequest: "ADVENTURE",
            name: "grimoire-set",
            private: "none",
            permissions: 0,
            syntax: "grimoire-set",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        let pDatas = await this.client.inventoryDb.get(this.message.author.id);

        if (pDatas.active_grimoire !== null) {
            return await this.ctx.reply(
                "Oups...",
                "Il semblerait qu'il y ait déjà un grimoire actif sur votre inventaire. Commencez par le retirer !",
                "📖",
                null,
                "outline",
            );
        }

        const emojis = {
            "adventurer": "🗺️",
            "economist": "💰",
            "eternal": "🪐",
            "falconer": "🦅",
            "fortunate": "🍀",
            "warrior": "🔥",
        };

        const grimoires = Object.entries(pDatas.grimoires).filter(g => g[1] > 0).filter(g => g[0] !== "mastery")
                          .map(e => [require(`../../elements/grimoires/${e[0]}.json`), emojis[e[0]], e[1]]);
        let str = `${grimoires.map(g => `${g[1]} **• \`id:${g[0].label}\` ${g[0].name}** (\`x${g[2]}\`)`).join("\n")}`;

        str += "\n\nRépondez au message ci-dessous avec l'id correspondant de votre grimoire. Répondez avec `n` (non) pour annuler. ";
        str += "Une fois que vous répondrez, votre grimoire sera automatiquement mis en place.";

        const msg = await this.ctx.reply("Équiper un grimoire.", str, "📖", null, "outline");
        const choice = await this.ctx.messageCollection(msg);

        if (Object.keys(emojis).includes(choice)) {
            pDatas = await this.client.inventoryDb.get(this.message.author.id);

            if (pDatas.active_grimoire !== null) {
                return await this.ctx.reply(
                    "Oups...",
                    "Il semblerait qu'il y ait déjà un grimoire actif sur votre inventaire. Commencez par le retirer !",
                    "📖",
                    null,
                    "outline",
                );
            }

            const grimDatas = grimoires.filter(g => g[0].label === choice)?.at(0)?.at(0);
            await this.client.inventoryDb.equipGrimoire(this.message.author.id, grimDatas.label);
            return await this.ctx.reply("Équiper un grimoire.", `Vous avez donc équipé **${grimDatas.name}**.`, "📖", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Équiper un grimoire.", "Vous avez décidé de ne pas équiper de grimoire.", "📖", null, "outline");
        }
        else {
            return await this.ctx.reply("Équiper un grimoire.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = GrimoireSet;