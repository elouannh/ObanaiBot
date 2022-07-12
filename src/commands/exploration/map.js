const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");
const map = require("../../elements/map");
const convertDate = require("../../utils/convertDate");

class Map extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["map"],
            args: [["player", "joueur dont vous souhaitez voir l'emplacement sur la carte. (ou vous)", false]],
            category: "Exploration",
            cooldown: 7,
            description: "Commande permettant de voir son emplacement sur la carte.",
            examples: ["[p]map @pandawou"],
            finishRequest: "ADVENTURE",
            name: "map",
            ownerOnly: false,
            permissions: 0,
            syntax: "map <?player>",
        });
    }

    async run() {
        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;

        const pExists = await this.client.playerDb.started(user.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const mDatas = await this.client.mapDb.get(user.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);
        const area = loc.Areas.filter(a => a.id === mDatas.area)?.at(0);

        let infos = "";

        infos += `\n> ${loc.emoji} **${loc.name}**`;

        infos += "\n\nZones de région:\n";
        const areaList = [];
        for (const area_ of loc.Areas) {
            const lastDig = mDatas.exploration[`${loc.id}_${area_.id}`]?.lastDig ?? null;
            const timeSpent = Date.now() - (lastDig ?? 0);
            let finalStr = `${map.BiomesEmojis[area_.biome]} • ${area_.id === area.id ? "***" : ""}${area_.name}${area_.id === area.id ? "***" : ""}  • `;

            if (lastDig === null || timeSpent > 7_200_000) finalStr += "🔎 Fouille **prête** !";
            else finalStr += `⏰ Fouille disponible dans **${convertDate(7_200_000 - (lastDig === null ? 0 : timeSpent), true).string}**`;

            areaList.push(finalStr);
        }
        infos += `${areaList.join("\n")}`;

        return await this.ctx.betterReply(`Emplacement de ${user.username}`, infos, "🗺️", null, "outline", true, { url: "https://cdn.discordapp.com/attachments/995812450970652672/995812746794909796/obanai_map_v1.jpg" });
    }
}

module.exports = Map;