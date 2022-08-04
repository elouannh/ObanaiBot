const Command = require("../../base/Command");

class SquadLeave extends Command {
    constructor() {
        super({
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant de quitter son escouade.",
            finishRequest: "ADVENTURE",
            name: "squad-leave",
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) {
            return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");
        }

        const msg = await this.ctx.reply(
            "Quitter votre escouade.",
            "Souhaitez-vous vraiment quitter l'escouade ?"
            +
            "\n\nRépondre avec `y` (oui) ou `n` (non).",
            "⛩️",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        if (this.ctx.isResp(choice, "y")) {
            const pDatas = await this.client.playerDb.get(this.message.author.id);

            if (pDatas.squad === null) {
                return await this.ctx.reply("Oups...", "Vous n'avez pas d'escouade à quitter.", null, null, "warning");
            }
            if (pDatas.squad.owner === this.message.author.id && pDatas.squad.right_hand === "") {
                return await this.ctx.reply(
                    "Oups...",
                    "Vous êtes le chef de votre escouade, "
                    +
                    "mais vous n'avez pas de bras droit qui peut prendre votre relève.",
                    null,
                    null,
                    "warning",
                );
            }

            await this.client.squadDb.leaveSquad(pDatas.squad.owner, pDatas.id);
            return await this.ctx.reply(
                "Quitter votre escouade.",
                "Le joueur a quitté l'escouade.",
                "⛩️",
                null,
                "outline",
            );
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply(
                "Quitter votre escouade.",
                "Le joueur n'a pas quitté l'escouade.",
                "⛩️",
                null,
                "outline",
            );
        }
        else {
            return await this.ctx.reply(
                "Quitter votre escouade.",
                "La commande n'a eas aboutie.",
                null,
                null,
                "timeout",
            );
        }

    }
}

module.exports = SquadLeave;