const Command = require("../../base/Command");

class GrimoireUnset extends Command {
    constructor() {
        super({
            aliases: ["grimoire-unset", "gu"],
            args: [],
            category: "Stats",
            cooldown: 15,
            description: "Commande permettant de retirer son grimoire.",
            examples: ["[p]grimoire-unset"],
            finishRequest: "ADVENTURE",
            name: "grimoire-unset",
            private: "none",
            permissions: 0,
            syntax: "grimoire-unset",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const msg = await this.ctx.reply(
            "Retirer un grimoire.",
            "Voulez-vous retirer votre grimoire actif ? Les effets appliqués dessus disparaitront. Vous gagnerez quelques yens de compensation."
            +
            "\n\nSi il s'agit d'un grimoire éternel, il reviendra juste dans votre inventaire.\n\nRépondre avec `y` (oui) ou `n` (non).",
            "📖",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        if (this.ctx.isResp(choice, "y")) {
            const pDatas = await this.client.inventoryDb.get(this.message.author.id);
            if (pDatas.active_grimoire === null) {
                return await this.ctx.reply("Oups...", "Il semblerait qu'il n'y ait pas de grimoire actif sur votre inventaire.", null, null, "warning");
            }

            const grimDatas = require(`../../elements/grimoires/${pDatas.active_grimoire}.json`);
            await this.client.inventoryDb.unequipGrimoire(this.message.author.id, this);
            return await this.ctx.reply("Retirer un grimoire.", `Vous avez donc retiré **${grimDatas.name}**.`, "📖", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Retirer un grimoire.", "Vous avez donc décidé de ne pas retirer votre grimoire.", "📖", null, "outline");
        }
        else {
            return await this.ctx.reply("Retirer un grimoire.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = GrimoireUnset;