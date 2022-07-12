const Command = require("../../base/Command");
const convertDate = require("../../utils/convertDate");

class SquadDelete extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-delete", "sqdl"],
            args: [],
            category: "Escouades",
            cooldown: 15,
            description: "Commande permettant de supprimer son escouade.",
            examples: ["[p]squad-delete"],
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

        const msg = await this.ctx.reply(
            "Supprimer votre escouade.",
            "Souhaitez-vous vraiment supprimer votre escouade ? Les membres qui s'y trouvent seront aussi exclus."
            +
            "\n\nRépondre avec `y` (oui) ou `n` (non).",
            "⛩️",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        if (this.ctx.isResp(choice, "y")) {
            const pDatas = await this.client.playerDb.get(this.message.author.id);

            if (pDatas.squad === null) return await this.ctx.reply("Oups...", "Vous ne possédez pas d'escouade.", null, null, "warning");
            if (pDatas.squad.owner !== this.message.author.id) return await this.ctx.reply("Oups...", "Seul les chefs d'escouade peuvent les supprimer.", null, null, "warning");
            const timeLeft = Date.now() - pDatas.squad.created;
            const days = 0;
            if (timeLeft < (days * 86_400_000)) {
                return await this.ctx.reply(
                    "Oups...",
                    "Pour supprimer une escouade, celle-ci doit exister depuis au moins 30 jours."
                    +
                    `Vous pourrez la supprimer dans: **${convertDate((days * 86_400_000) - timeLeft, true).string}**.`,
                    null,
                    null,
                    "warning",
                );
            }

            await this.client.squadDb.deleteSquad(pDatas.squad.owner);
            return await this.ctx.reply("Adieu, petite escouade...", `Votre escouade **${pDatas.squad.name}** a bien été supprimée définitivement.`, "👋", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Supprimer votre escouade.", "Vous avez décidé de ne pas supprimer votre escouade.", "⛩️", null, "outline");
        }
        else {
            return await this.ctx.reply("Supprimer votre escouade.", "La commande n'a pas aboutie.", null, null, "timeout");
        }

    }
}

module.exports = SquadDelete;