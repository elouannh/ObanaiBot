const Command = require("../../base/Command");

class Start extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["start", "st"],
            args: [],
            category: "Stats",
            cooldown: 15,
            description: "Commande permettant de commencer votre aventure.",
            examples: ["start"],
            finishRequest: "ADVENTURE",
            name: "start",
            ownerOnly: false,
            permissions: 0,
            syntax: "start",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous avez déjà commencé votre aventure.", null, null, "error");

        const msg = await this.ctx.reply(
            "Voulez-vous vraiment commencer votre aventure ?",
            "Rejoignez-nous dès maintenant dans une folle aventure !\n\nRépondre avec `y` (oui) ou `n` (non).",
            "🥳",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);
        if (this.ctx.isResp(choice, "y")) {
            await this.client.playerDb.createAdventure(this.message.author.id);
            return await this.ctx.reply(
                "Bienvenue jeune joueur !",
                "Vous êtes désormais un joueur Obanai. Vous pouvez voir la liste des commandes à tout moment avec la commande help.",
                "🎉",
                null,
                "outline",
            );
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("J'espère bientôt vous revoir !", "N'hésitez pas à venir me voir lorsque vous souhaitez commencer.", "👋", null, "outline");
        }
        else {
            return await this.ctx.reply(
                "Commencer votre aventure.",
                "La commande n'a pas aboutie. Soit vous avez mis trop de temps à répondre, soit vous n'avez pas répondu comme convenu.",
                null,
                null,
                "timeout",
            );
        }
    }
}

module.exports = Start;