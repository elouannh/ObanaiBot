const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class SquadPromote extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-promote", "sq-pro"],
            args: [["player", "joueur de l'escouade à promouvoir.", true]],
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant de promouvoir un membre de son escouade au rang de bras droit.",
            examples: ["squad-promote @pandawou"],
            finishRequest: "ADVENTURE",
            name: "squad-promote",
            ownerOnly: false,
            permissions: 0,
            syntax: "squad-promote <player>",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.playerDb.get(this.message.author.id);
        if (pDatas.squad === null) return await this.ctx.reply("Aucune escouade.", "Aucune escouade n'a été trouvée pour ce joueur.", null, null, "info");

        const sDatas = await this.client.squadDb.get(pDatas.squad);
        if (sDatas.owner !== this.message.author.id) return await this.ctx.reply("Vous n'avez pas l'autorisation.", "Pour promouvoir quelqu'un de votre escouade, vous devez être **Chef d'escouade**.", null, null, "info");

        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;
        if (user.id === this.message.author.id) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous ne pouvez pas vous promouvoir vous-même.", null, null, "error");

        const msg = await this.ctx.reply("Où est le bras gauche ?", `Souhaitez-vous vraiment promouvoir **${user.username}** de l'escouade **${sDatas.name}** au rang de **Bras droit** ?\n\n*Si un bras droit était déjà présent, il sera automatiquement dégradé.*`, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);

        if (choice === "✅") {
            if ((await this.client.squadDb.hasPlayer(sDatas.owner, user.id)) === false) return await this.ctx.reply("Où est le bras gauche ?", "Ce joueur ne fait pas partie de l'escouade.", null, null, "info");
            if (sDatas.right_hand === user.id) return await this.ctx.reply("Où est le bras gauche ?", "Ce joueur est déjà le bras gauche de l'escouade.", null, null, "info");
            await this.client.squadDb.promote(sDatas.owner, user.id);
            return await this.ctx.reply("Où est le bras gauche ?", "Le joueur a été promu au rang de **Bras droit** de l'escouade.", null, null, "success");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Où est le bras gauche ?", "Le joueur n'a pas été promu.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Où est le bras gauche ?", "La commande n'a pas aboutie.", null, null, "timeout");
        }

    }
}

module.exports = new SquadPromote();