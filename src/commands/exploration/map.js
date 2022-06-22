const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");
const map = require("../../elements/map");

class Map extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["map"],
            args: [["player", "joueur dont vous souhaitez voir l'emplacement sur la carte. (ou vous)", false]],
            category: "Exploration",
            cooldown: 5,
            description: "Commande permettant de voir son emplacement sur la carte.",
            examples: ["map @pandawou"],
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

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);
        const zone = loc.Areas.filter(a => a.id === mDatas.area)?.at(0);

        const title = `Emplacement de ${user.username}`;
        let infos = "*```diff\n- Le visuel de la carte arrivera prochainement.```*";

        infos += "\n**Localisation**";
        infos += `\n> ${loc.emoji} **${loc.name}** | **${zone.name}**`;
        infos += `\n*(Coordonnées GPS: ${loc.x}X/${loc.y}Y/${zone.id}R)*`;

        infos += "\n\n**Débouchés de voyage**";
        infos += `\n**\`\`\`${map.Regions.filter(r => r.accesses.includes(loc.id)).map(r => `- ${r.name}`).join("\n")}\`\`\`**`;
        infos += `\n**Autres zones de région:** ${loc.Areas.filter(a => a.id !== zone.id).length > 0 ? loc.Areas.filter(a => a.id !== zone.id).map(r => `**${r.name}**`).join(", ") : "Aucune autre zone."}`;

        return await this.ctx.reply(title, infos, "🗺️", null, "outline");
    }
}

module.exports = new Map();