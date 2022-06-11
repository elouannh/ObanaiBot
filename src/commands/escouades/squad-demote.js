const Command = require("../../base/Command");

class SquadKick extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-demote", "sqdm"],
            args: [],
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant de dégrader son bras droit de l'escouade.",
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

        const msg = await this.ctx.reply("Dégrader votre bras droit.", "Souhaitez-vous vraiment dégrader votre bras droit de l'escouade ?\n\n**__Requis :__**```diff\n- Être le chef d'escouade\n- Avoir une escouade\n- Avoir un bras droit d'escouade```\n\nRépondre avec `y` (oui) ou `n` (non).", "⛩️", null, "outline");
        const choice = await this.ctx.messageCollection(msg);

        if (this.ctx.isResp(choice, "y")) {
            const pDatas = await this.client.playerDb.get(this.message.author.id);

            if (pDatas.squad === null) return await this.ctx.reply("Oups...", "Vous ne possédez pas d'escouade.", null, null, "warning");
            if (pDatas.squad.owner !== this.message.author.id) return await this.ctx.reply("Oups...", "Seul les chefs d'escouade peuvent les supprimer.", null, null, "warning");
            if (pDatas.squad.right_hand === "") return await this.ctx.reply("Oups...", "Votre escouade ne possède pas de bras droit.", null, null, "warning");

            await this.client.squadDb.demote(pDatas.squad.owner);
            return await this.ctx.reply("Dégrader votre bras droit.", "Le bras droit a bien été retiré de ses fonctions.", "⛩️", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Dégrader votre bras droit.", "Personne n'a été dégradé.", "⛩️", null, "outline");
        }
        else {
            return await this.ctx.reply("Dégrader votre bras droit.", "La commande n'a pas aboutie.", null, null, "timeout");
        }

    }
}

module.exports = new SquadKick();