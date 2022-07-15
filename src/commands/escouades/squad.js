const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class Squad extends Command {
    constructor() {
        super({
            aliases: ["squad", "sq"],
            args: [["player", "joueur dont vous souhaitez voir l'escouade (ou vous).", false]],
            category: "Escouades",
            cooldown: 7,
            description: "Commande permettant de voir son escouade.",
            examples: ["[p]squad @pandawou"],
            finishRequest: "ADVENTURE",
            name: "squad",
            private: "none",
            permissions: 0n,
            syntax: "squad <?player>",
        });
    }

    async run() {
        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;

        const pExists = await this.client.playerDb.started(user.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.playerDb.get(user.id);
        if (pDatas.squad === null) return await this.ctx.reply("Oups...", "Aucune escouade n'a été trouvée pour ce joueur.", null, null, "warning");

        const mDatas = pDatas.squad;
        const title = `Escouade de ${user.username}`;
        let squad = "";

        let totalExp = 0;
        let members = {};
        mDatas.members.forEach(m => {
            const tempPDatas = this.client.playerDb.db.get(m);
            totalExp += tempPDatas.exp;
            let emoji = "⬛";
            if (mDatas.owner === m) emoji = "👑";
            if (mDatas.right_hand === m) emoji = "⚜️";
            if (mDatas.leader === m) emoji = "🎖️";
            members[m] = [`${emoji} ${this.client.users.cache.get(m)?.username ?? "Joueur"} | ⭐ ${tempPDatas.exp}`, tempPDatas.exp];
        });

        members = Object.entries(members).sort((a, b) => b[1][1] - a[1][1]);

        squad += `\n> **${mDatas.name}** | ${totalExp} :star: | \`id: #${mDatas.id.toUpperCase()}\``;

        squad += `\n\n"*${mDatas.quote}*" - ${this.client.users.cache.get(mDatas.owner)?.username ?? "Chef d'escouade"}, ${new Date(mDatas.created).getFullYear()}`;

        squad += `\n\n> Membres: **${mDatas.members.length}**/8\n`;
        squad += `\`\`\`${members.map(e => e[1][0]).join("\n")}\`\`\``;

        return await this.ctx.reply(title, squad, "⛩️", null, "outline");
    }
}

module.exports = Squad;