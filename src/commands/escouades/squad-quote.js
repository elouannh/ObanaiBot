const Command = require("../../base/Command");

class SquadQuote extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-quote", "sq-qt"],
            args: [["quote", "nouvelle citation pour l'escouade", true]],
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant de changer la citation de votre escouade.",
            examples: ["squad-quote Nous sommes les plus forts"],
            finishRequest: "ADVENTURE",
            name: "squad-quote",
            ownerOnly: false,
            permissions: 0,
            syntax: "squad-quote <quote>",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.playerDb.get(this.message.author.id);
        if (pDatas.squad === null) return await this.ctx.reply("Aucune escouade.", "Aucune escouade n'a été trouvée pour ce joueur.", null, null, "info");

        const name = this.args.join(" ");
        let r = name.match(new RegExp("([a-zA-Z\\s]{1,}\\s?[0-9]{0,}\\D{0,}){0,}", "g"));
        r = r?.join(" ")?.slice(0, 400).split(/ +/).join(" ");

        if (r === undefined || r?.length < 10) return await this.ctx.reply("Nouvelle citation invalide.", "Votre citation doit contenir entre **10** et **200** caractères, et doit être de la forme suivante:```([a-zA-Z\\s]{1,}\\s?[0-9]{0,}\\D{0,}){0,}```\n```Exemples:\n- squad-quote Nous sommes les meilleurs !```", null, null, "error");

        const msg = await this.ctx.reply("Changement de citation.", `Souhaitez-vous changer la citation de votre escouade ?\nLa nouvelle citation sera: \`${r}\``, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);
        if (choice === "✅") {

            const p2Datas = await this.client.playerDb.get(this.message.author.id);
            if (p2Datas.squad === null) return await this.ctx.reply("Aucune escouade.", "Aucune escouade n'a été trouvée pour ce joueur.", null, null, "info");

            const sDatas = await this.client.squadDb.get(p2Datas.squad);
            if (![sDatas.owner, sDatas.right_hand].includes(this.message.author.id)) return await this.ctx.reply("Vous n'avez pas l'autorisation.", "Pour changer la citation de votre escouade, vous devez être **Chef d'escouade** ou **Bras droit**.", null, null, "info");

            await this.client.squadDb.changeQuote(sDatas.owner, r);
            return await this.ctx.reply("Changement de citation.", "La citation a bien été modifiée.", null, null, "success");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Changement de citation.", "La citation n'a donc pas été modifiée.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Changement de citation.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = new SquadQuote();