const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");
const calcPlayerLevel = require("../../elements/calcPlayerLevel");
const intRender = require("../../utils/intRender");

class Rank extends Command {
    constructor() {
        super({
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir son rank de pourfendeur.",
            finishRequest: "ADVENTURE",
            name: "rank",
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;

        const pExists = await this.client.playerDb.started(user.id);
        if (!pExists) {
            return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");
        }

        const pDatas = await this.client.playerDb.get(user.id);
        const eDatas = await this.client.externalServerDb.get(user.id);

        let rank = "";
        const playerLevel = calcPlayerLevel(pDatas.exp);
        rank += `Niveau: **${playerLevel.level}** | Exp total: ⭐ **${intRender(pDatas.exp, " ")}**`;
        rank += `\nExp du niveau: ⭐ **${
            intRender(playerLevel.tempExp, " ")}**/${intRender(playerLevel.required, " ")
        }`;

        rank += "\n\nBadges: ";
        rank += `🚜 **Fermier** ${
            this.client.externalServerDb.getProgress("farmer", eDatas.badges.farmer.value, "minimal")
        } • `;
        rank += `🗺️ **Aventurier** ${
            this.client.externalServerDb.getProgress("adventurer", eDatas.badges.adventurer.value, "minimal")
        } • `;
        rank += `💀 **Dominateur** ${
            this.client.externalServerDb.getProgress("domineering", eDatas.badges.domineering.value, "minimal")
        } • `;
        rank += `⛩️ **Chef de guerre** ${
            this.client.externalServerDb.getProgress("warChief", eDatas.badges.warChief.value, "minimal")
        } • `;
        rank += `🔎 **Archéologue** ${
            this.client.externalServerDb.getProgress("archaeologist", eDatas.badges.archaeologist.value, "minimal")
        } • `;
        rank += `🦅 **Maître fauconnier** ${
            this.client.externalServerDb.getProgress("masterFalconer", eDatas.badges.masterFalconer.value, "minimal")
        }`;

        rank += "\n\nGrades: ";
        const grades = {
            "vip": "VIP",
            "vip+": "VIP(+)",
        };
        rank += `${eDatas.grades.length > 0 ? eDatas.grades.map(e => `**${grades[e]}**`).join(" • ") : "aucun grade."}`;

        await this.ctx.reply(`Rank de ${user.username}`, rank, "🏆", null, "outline");
    }
}

module.exports = Rank;