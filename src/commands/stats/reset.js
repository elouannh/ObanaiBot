const Command = require("../../base/Command");

class Start extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["reset", "rs"],
            args: [],
            category: "Stats",
            cooldown: 15,
            description: "Commande permettant de remettre votre aventure à 0.",
            examples: ["reset"],
            finishRequest: "ADVENTURE",
            name: "reset",
            ownerOnly: false,
            permissions: 0,
            syntax: "reset",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous n'avez pas commencé votre aventure. Si vous désirez le faire, faites la commande start.", null, null, "error");

        const msg = await this.ctx.reply("Voulez-vous vraiment supprimer votre aventure ?", "```diff\n- CE CHOIX EST DÉFINITIF, ET TOUTE PROGRESSION SERA PERDUE POUR TOUJOURS (c'est très long !)```\n\nRépondre avec `y` (oui) ou `n` (non).", "❗", null, "outline");
        const choice = await this.ctx.messageCollection(msg);
        if (this.ctx.isResp(choice, "y")) {
            await this.client.playerDb.deleteAdventure(this.message.author.id);
            return await this.ctx.reply("Au revoir, et à bientôt.", "Vous n'êtes désormais plus un joueur Obanai. Votre progression a bien été supprimée.", "👋", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("J'espère bientôt vous revoir !", "N'hésitez pas à venir me voir lorsque vous souhaitez supprimer votre aventure.", "👋", null, "outline");
        }
        else {
            return await this.ctx.reply("Supprimer votre aventure.", "La commande n'a pas aboutie. Soit vous avez mis trop de temps à répondre, soit vous n'avez pas répondu comme convenu.", null, null, "timeout");
        }
    }
}

module.exports = new Start();