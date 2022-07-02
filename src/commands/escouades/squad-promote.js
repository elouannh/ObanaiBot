const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class SquadPromote extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-promote", "sqpro"],
            args: [["player", "joueur de l'escouade à promouvoir.", true]],
            category: "Escouades",
            cooldown: 30,
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

        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;
        if (user.id === this.message.author.id) return await this.ctx.reply("Oups...", "Vous ne pouvez pas vous inviter vous-même.", null, null, "warning");

        const msg = await this.ctx.reply(
            "Promotion d'un joueur de l'escouade.",
            `Souhaitez-vous vraiment promouvoir **${user.username}** au rang de bras droit ?`
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
            if (pDatas.squad.owner !== this.message.author.id) {
                return await this.ctx.reply("Oups...", "Seul les chefs d'escouade peuvent promouvoir des gens.", null, null, "warning");
            }
            const uExists = await this.client.playerDb.started(user.id);
            if (!uExists) return await this.ctx.reply("Oups...", "Le profil du joueur à promouvoir est introuvable.", null, null, "warning");
            if (!pDatas.squad.members.includes(user.id)) return await this.ctx.reply("Oups...", "Ce joueur ne se trouve pas dans votre escouade.", null, null, "warning");
            if (pDatas.squad.right_hand === user.id) return await this.ctx.reply("Oups...", "Ce joueur est déjà le bras droit de l'escouade.", null, null, "warning");

            await this.client.squadDb.promote(pDatas.squad.owner, user.id);
            return await this.ctx.reply("Promotion d'un joueur de l'escouade.", "Le joueur a été promu bras droit de l'escouade.", "⛩️", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Promotion d'un joueur de l'escouade.", "Le joueur n'a pas été promo bras droit de l'escouade.", "⛩️", null, "outline");
        }
        else {
            return await this.ctx.reply("Promotion d'un joueur de l'escouade.", "La commande n'a pas aboutie.", null, null, "timeout");
        }

    }
}

module.exports = SquadPromote;