const Command = require("../../base/Command");
const convertDate = require("../../utils/convertDate");

class SquadDelete extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-delete", "sq-dl"],
            args: [],
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant de supprimer son escouade.",
            examples: ["squad-delete"],
            finishRequest: "ADVENTURE",
            name: "squad-delete",
            ownerOnly: false,
            permissions: 0,
            syntax: "squad-delete",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.playerDb.get(this.message.author.id);
        if (pDatas.squad === null) return await this.ctx.reply("Vous n'avez pas d'escouade.", "Afin de supprimer une escouade, il faudrait déjà en posséder une.", null, null, "info");
        if (pDatas.squad !== this.message.author.id) return await this.ctx.reply("Vous n'êtes pas chef.", "Pour supprimer une escouade, vous devez en être le chef !", null, null, "info");

        const sDatas = await this.client.squadDb.get(pDatas.squad);
        const timeLeft = Date.now() - sDatas.created;
        const days = 0;
        if (timeLeft < (days * 86_400_000)) return await this.ctx.reply("Escouade trop récente.", `Pour supprimer une escouade, celle-ci doit exister depuis au moins 30 jours. Vous pourrez la supprimer dans: **${convertDate((days * 86_400_000) - timeLeft, true).string}**.`, null, null, "info");

        const msg = await this.ctx.reply("Supprimer votre escouade.", `Souhaitez-vous vraiment supprimer **${sDatas.name}** ? Les **${sDatas.members.length}** membres qui s'y trouvent seront aussi exclus.`, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);

        if (choice === "✅") {
            await this.client.squadDb.deleteSquad(sDatas.owner);
            return await this.ctx.reply("Escouade supprimée !", `Votre escouade **${sDatas.name}** a bien été supprimée !`, null, null, "success");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Supprimer une escouade.", "Vous avez décidé de ne pas supprimer votre escouade.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Supprimer une escouade.", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }

    }
}

module.exports = new SquadDelete();