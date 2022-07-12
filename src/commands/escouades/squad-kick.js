const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class SquadKick extends Command {
    constructor() {
        super({
            aliases: ["squad-kick", "sqki"],
            args: [["player", "joueur que vous voulez exclure.", true]],
            category: "Escouades",
            cooldown: 15,
            description: "Commande permettant d'exclure des membres de son escouade.",
            examples: ["[p]squad-kick @pandawou"],
            finishRequest: "ADVENTURE",
            name: "squad-kick",
            private: "none",
            permissions: 0,
            syntax: "squad-kick <player>",
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
            "Exclusion d'un joueur de l'escouade.",
            `Souhaitez-vous vraiment exclure **${user.username}** de votre escouade ?`
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
            if (pDatas.squad.owner !== this.message.author.id) return await this.ctx.reply("Oups...", "Seul les chefs d'escouade peuvent exclure des gens.", null, null, "warning");
            const uExists = await this.client.playerDb.started(user.id);
            if (!uExists) return await this.ctx.reply("Oups...", "Le profil du joueur à exclure est introuvable.", null, null, "warning");
            if (!pDatas.squad.members.includes(user.id)) return await this.ctx.reply("Oups...", "Ce joueur ne se trouve pas dans votre escouade.", null, null, "warning");

            await this.client.squadDb.leaveSquad(pDatas.squad.owner, user.id);
            return await this.ctx.reply("Exclusion d'un joueur de l'escouade.", "Le joueur a été exclu de l'escouade.", "⛩️", null, "outline");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Exclusion d'un joueur de l'escouade.", "Le joueur n'a pas été exclu de l'escouade.", "⛩️", null, "outline");
        }
        else if (choice === null) {
            return await this.ctx.reply("Exclusion d'un joueur de l'escouade.", "La commande n'a pas aboutie.", null, null, "timeout");
        }

    }
}

module.exports = SquadKick;