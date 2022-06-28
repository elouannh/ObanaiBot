const Command = require("../../base/Command");

class SquadQuote extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-quote", "sqqt"],
            args: [["quote", "nouvelle citation pour l'escouade", true]],
            category: "Escouades",
            cooldown: 30,
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

        const name = this.args.join(" ");
        let r = name.match(new RegExp("([a-zA-Z\\s]{1,}\\s?[0-9]{0,}\\D{0,}){0,}", "g"));
        r = r?.join(" ")?.slice(0, 400).split(/ +/).join(" ");

        if (r === undefined || r?.length < 10) {
            return await this.ctx.reply(
                "Nouvelle citation invalide.",
                "Votre citation doit contenir entre **10** et **200** caractères, et doit être de la forme suivante:"
                +
                "\n```([a-zA-Z\\s]{1,}\\s?[0-9]{0,}\\D{0,}){0,}```\n```Exemples:\n- squad-quote Nous sommes les meilleurs !```",
                null,
                null,
                "warning",
            );
        }
        const msg = await this.ctx.reply(
            "Changement de citation.",
            "Souhaitez-vous changer la citation de votre escouade ?\nLa nouvelle citation sera: "
            +
            `\`${r}\`\n\nRépondre avec \`y\` (oui) ou \`n\` (non).`,
            "⛩️",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        if (this.ctx.isResp(choice, "y")) {
            const pDatas = await this.client.playerDb.get(this.message.author.id);

            if (pDatas.squad === null) return await this.ctx.reply("Oups...", "Vous ne possédez pas d'escouade.", "⛩️", null, "outline");
            if (pDatas.squad.owner !== this.message.author.id && pDatas.squad.right_hand !== this.message.author.id) {
                return await this.ctx.reply("Oups...", "Seul les chefs d'escouade et les bras droits peuvent changer les citations d'escouade.", null, null, "warning");
            }

            await this.client.squadDb.changeQuote(pDatas.squad.owner, r);
            return await this.ctx.reply("Changement de citation.", "La citation a bien été modifiée.", "⛩️", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Changement de citation.", "La citation n'a donc pas été modifiée.", "⛩️", null, "outline");
        }
        else {
            return await this.ctx.reply("Changement de citation.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = new SquadQuote();