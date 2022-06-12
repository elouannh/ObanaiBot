const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class SquadRename extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-rename", "sq-name"],
            args: [["name", "nouveau nom pour l'escouade", true]],
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant de renommer votre escouade.",
            examples: ["squad-rename Escouade des pigeons"],
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

        const pDatas = await this.client.playerDb.get(this.message.author.id);
        if (pDatas.squad === null) return await this.ctx.reply("Aucune escouade.", "Aucune escouade n'a été trouvée pour ce joueur.", null, null, "info");

        const name = this.args.join(" ");
        let r = name.match(new RegExp("[a-zA-Z\\s]{1,}\\s?[0-9]{0,}", "g"));
        r = r?.at(0)?.slice(0, 20);

        if (r === undefined || r?.length < 3) return await this.ctx.reply("Nouveau nom invalide.", "Votre nom doit contenir entre **3** et **20** caractères, et doit être de la forme suivante:```[a-zA-Z\\s]{1,}\\s?[0-9]{0,}```\n```Exemples:\n- squad-rename Escouade des meilleurs```", null, null, "error");

        const msg = await this.ctx.reply("Changement de nom.", `Souhaitez-vous changer le nom de votre escouade ?\nLe nouveau nom sera: \`${r}\``, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);
        if (choice === "✅") {

            const p2Datas = await this.client.playerDb.get(this.message.author.id);
            if (p2Datas.squad === null) return await this.ctx.reply("Aucune escouade.", "Aucune escouade n'a été trouvée pour ce joueur.", null, null, "info");

            const sDatas = await this.client.squadDb.get(p2Datas.squad);
            if (![sDatas.owner, sDatas.right_hand].includes(this.message.author.id)) return await this.ctx.reply("Vous n'avez pas l'autorisation.", "Pour changer le nom de votre escouade, vous devez être **Chef d'escouade** ou **Bras droit**.", null, null, "info");

            await this.client.squadDb.rename(sDatas.owner, r);
            return await this.ctx.reply("Changement de nom.", "Le nom a bien été modifié.", null, null, "success");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Changement de nom.", "Le nom n'a donc pas été modifié.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Changement de nom.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = new SquadRename();