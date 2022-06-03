const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class SquadKick extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-kick", "sq-kick"],
            args: [["player", "joueur que vous voulez exclure.", true]],
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant d'exclure des membres de son escouade.",
            examples: ["squad-kick @pandawou"],
            finishRequest: "ADVENTURE",
            name: "squad-kick",
            ownerOnly: false,
            permissions: 0,
            syntax: "squad-kick <player>",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.playerDb.get(this.message.author.id);
        if (pDatas.squad === null) return await this.ctx.reply("Aucune escouade.", "Aucune escouade n'a été trouvée pour ce joueur.", null, null, "info");

        const sDatas = await this.client.squadDb.get(pDatas.squad);
        if (sDatas.owner !== this.message.author.id) return await this.ctx.reply("Vous n'avez pas l'autorisation.", "Pour exclure quelqu'un de votre escouade, vous devez être **Chef d'escouade**.", null, null, "info");

        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;
        if (user.id === this.message.author.id) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous ne pouvez pas vous exclure vous-même.", null, null, "error");

        const msg = await this.ctx.reply("Doit-on lui dire au revoir ?", `Souhaitez-vous vraiment exclure **${user.username}** de l'escouade **${sDatas.name}** ?`, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);

        if (choice === "✅") {
            if ((await this.client.squadDb.hasPlayer(sDatas.owner, user.id)) === false) return await this.ctx.reply("Doit-on lui dire au revoir ?", "Ce joueur ne fait pas partie de l'escouade.", null, null, "info");
            await this.client.squadDb.leaveSquad(sDatas.owner, user.id);
            return await this.ctx.reply("Doit-on lui dire au revoir ?", "Le joueur a été exclu de l'escouade.", null, null, "success");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Doit-on lui dire au revoir ?", "Le joueur n'a pas été exclu de l'escouade.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Doit-on lui dire au revoir ?", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }

    }
}

module.exports = new SquadKick();