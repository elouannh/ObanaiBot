const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class SquadInvite extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-invite", "sq-inv"],
            args: [["player", "joueur que vous voulez inviter.", true]],
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant d'inviter des membres dans son escouade.",
            examples: ["squad-invite @pandawou"],
            finishRequest: "ADVENTURE",
            name: "squad-invite",
            ownerOnly: false,
            permissions: 0,
            syntax: "squad-invite <player>",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.playerDb.get(this.message.author.id);
        if (pDatas.squad === null) return await this.ctx.reply("Aucune escouade.", "Aucune escouade n'a été trouvée pour ce joueur.", null, null, "info");

        const sDatas = await this.client.squadDb.get(pDatas.squad);
        if (sDatas.owner !== this.message.author.id) return await this.ctx.reply("Vous n'avez pas l'autorisation.", "Pour inviter quelqu'un dans votre escouade, vous devez être **Chef d'escouade**.", null, null, "info");

        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;
        if (user.id === this.message.author.id) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous ne pouvez pas vous inviter vous-même.", null, null, "error");

        const msg = await this.ctx.reply("Oh, un nouveau membre ?", `**${user.username}**, voulez-vous rejoindre l'escouade **${sDatas.name}** ?`, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"], 30_000, user.id);

        if (choice === "✅") {
            const uExists = await this.client.playerDb.started(user.id);
            if (!uExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

            if (await this.client.squadDb.isFull(pDatas.squad)) return await this.ctx.reply("Cette escouade est complète.", "Cette escouade contient déjà le nombre maximum de joueurs.", null, null, "error");
            if (await this.client.playerDb.hasSquad(user.id)) return await this.ctx.reply("Ce joueur possède déjà une escouade.", "Ce joueur possède déjà une escouade, il est donc impossible de l'inviter dans la votre.", null, null, "info");

            await this.client.squadDb.joinSquad(sDatas.owner, user.id);
            return await this.ctx.reply("Oh, un nouveau membre ?", "Le joueur a accepté de rejoindre l'escouade.", null, null, "success");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Oh, un nouveau membre ?", "Le joueur a refusé de rejoindre l'escouade.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Oh, un nouveau membre ?", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }
    }
}

module.exports = new SquadInvite();