const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class SquadKick extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-demote", "sq-dm"],
            args: [],
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant de dégrader quelqu'un de son escouade.",
            examples: ["squad-demote"],
            finishRequest: "ADVENTURE",
            name: "squad-demote",
            ownerOnly: false,
            permissions: 0,
            syntax: "squad-demote",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.playerDb.get(this.message.author.id);
        if (pDatas.squad === null) return await this.ctx.reply("Aucune escouade.", "Aucune escouade n'a été trouvée pour ce joueur.", null, null, "info");

        const sDatas = await this.client.squadDb.get(pDatas.squad);
        if (sDatas.owner !== this.message.author.id) return await this.ctx.reply("Vous n'avez pas l'autorisation.", "Pour dégrader quelqu'un de votre escouade, vous devez être **Chef d'escouade**.", null, null, "info");
        if (sDatas.right_hand === "") return await this.ctx.reply("Vous n'avez pas l'autorisation.", "Pour dégrader quelqu'un de votre escouade, il faut qu'il y ait déjà un **Bras droit**.", null, null, "info");

        const msg = await this.ctx.reply("Changement de gouvernement", `Souhaitez-vous vraiment dégrader **${this.client.users.cache.get(sDatas.right_hand).username}** du rang de **Bras droit** de l'escouade **${sDatas.name}** ?`, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);

        if (choice === "✅") {
            if ((await this.client.squadDb.hasPlayer(sDatas.owner, pDatas.id)) === false) return await this.ctx.reply("Changement de gouvernement", "Ce joueur ne fait pas partie de l'escouade.", null, null, "info");
            await this.client.squadDb.demote(sDatas.owner, pDatas.id);
            return await this.ctx.reply("Changement de gouvernement", "Le joueur a bien été dégradé.", null, null, "success");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Changement de gouvernement", "Le joueur n'a pas été dégradé.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Changement de gouvernement", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }

    }
}

module.exports = new SquadKick();