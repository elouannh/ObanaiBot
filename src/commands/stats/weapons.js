const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class Weapons extends Command {
    constructor() {
        super({
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir son inventaire d'armes.",
            finishRequest: "ADVENTURE",
            name: "weapons",
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

        const iDatas = await this.client.inventoryDb.get(user.id);
        let weapons = "**Équipée**\n```";
        weapons += `Nom: ${iDatas.weapon.name}\nRareté: ${iDatas.weapon.rarity}\`\`\``;

        weapons += "\n**Stock**\n```";
        weapons += `${iDatas.weapons.length === 0 ?
                   "Aucune arme en stock."
                   : iDatas.weapons.filter(e => e !== undefined)
                                   .sort((a, b) => b.rarity - a.rarity)
                                   .map((e, i) => `${i + 1} • ${e.name} (rareté ${e.rarity})`)}\`\`\``;

        await this.ctx.reply(`Inventaire d'armes de ${user.username}`, weapons, "🗡️", null, "outline");
    }
}

module.exports = Weapons;