const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");
const calcPlayerLevel = require("../../elements/calcPlayerLevel");
const intRender = require("../../utils/intRender");

class Rank extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["rank", "r"],
            args: [["player", "joueur dont vous souhaitez voir le rang de jeu. (ou vous)", false]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir son rank de pourfendeur.",
            examples: ["rank @pandawou"],
            finishRequest: "ADVENTURE",
            name: "rank",
            ownerOnly: false,
            permissions: 0,
            syntax: "rank <?player>",
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

        let rank = "";
        const playerLevel = calcPlayerLevel(pDatas.exp);
        rank += `Niveau: **${playerLevel.level}** | Exp total: ⭐ **${intRender(pDatas.exp, " ")}**`;
        rank += `\nExp du niveau: ⭐ **${intRender(playerLevel.tempExp, " ")}**/${intRender(playerLevel.required, " ")}`;


        await this.ctx.reply(`Rank de ${user.username}`, rank, "🏆", null, "outline");
    }
}

module.exports = Rank;