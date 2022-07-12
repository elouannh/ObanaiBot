const Command = require("../../base/Command");

class SquadRename extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-rename", "sqrn"],
            args: [["name", "nouveau nom pour l'escouade.", true]],
            category: "Escouades",
            cooldown: 7,
            description: "Commande permettant de renommer votre escouade.",
            examples: ["[p]squad-rename Escouade des pigeons"],
            finishRequest: "ADVENTURE",
            name: "squad-rename",
            ownerOnly: false,
            permissions: 0,
            syntax: "squad-rename <name>",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const name = this.args.join(" ");
        let r = name.match(new RegExp("[a-zA-Z\\s]{1,}\\s?[0-9]{0,}", "g"));
        r = r?.at(0)?.slice(0, 40);

        if (r === undefined || r?.length < 10) {
            return await this.ctx.reply(
                "Nouveau nom invalide.",
                "Votre nom doit contenir entre **10** et **40** caractères, et doit être de la forme suivante:"
                +
                "\n```[a-zA-Z\\s]{1,}\\s?[0-9]{0,}```\n```Exemples:\n- squad-rename Escouade des bg```",
                null,
                null,
                "warning",
            );
        }

        const msg = await this.ctx.reply(
            "Changement de nom.",
            "Souhaitez-vous changer le nom de votre escouade ?\nLe nouveau nom sera: "
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
                return await this.ctx.reply("Oups...", "Seul les chefs d'escouade et les bras droits peuvent changer le nom d'escouade.", null, null, "warning");
            }

            await this.client.squadDb.rename(pDatas.squad.owner, r);
            return await this.ctx.reply("Changement de nom.", "Le nom a bien été modifié.", "⛩️", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Changement de nom.", "Le nom n'a donc pas été modifié.", "⛩️", null, "outline");
        }
        else {
            return await this.ctx.reply("Changement de nom.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = SquadRename;