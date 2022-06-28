const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class Weapons extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["weapons", "w"],
            args: [["player", "joueur dont vous souhaitez voir l'invetaire de jeu. (ou vous)", false]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir son inventaire d'armes.",
            examples: ["weapons @pandawou"],
            finishRequest: "ADVENTURE",
            name: "weapons",
            ownerOnly: false,
            permissions: 0,
            syntax: "weapons <?player>",
        });
    }

    async run() {
        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;

        const pExists = await this.client.playerDb.started(user.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const iDatas = await this.client.inventoryDb.get(user.id);
        let weapons = "**Équipée**\n```";
        weapons += `Nom: ${iDatas.weapon.name}\nRareté: ${iDatas.weapon.rarity}\`\`\``;

        weapons += "\n**Stock**\n```";
        weapons += `${iDatas.weapons.length === 0 ? "Aucune arme en stock." : iDatas.weapons.sort((a, b) => b.rarity - a.rarity).map((e, i) => `${i} • ${e.name} (rareté ${e.rarity})`)}\`\`\``;

        await this.ctx.reply(`Inventaire d'armes de ${user.username}`, weapons, "🗡️", null, "outline");
    }
}

module.exports = new Weapons();