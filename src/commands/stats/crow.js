const Command = require("../../base/Command");
const calcCrowLevel = require("../../elements/calcCrowLevel");


class Crow extends Command {
    constructor() {
        super({
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de voir son corbeau de liaison.",
            finishRequest: "ADVENTURE",
            name: "crow",
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

        const pDatas = await this.client.inventoryDb.get(user.id);

        const crowLevel = calcCrowLevel(pDatas.kasugai_crow_exp);
        const boost = crowLevel.level;
        const crows_boost = {
            "experience_gain": `+${boost * 2.5}%⭐`,
            "yens_gain": `+${boost * 2.5}%💰`,
            "travelling_time": `-${boost * 2.5}%🕣 voyage`,
            "training_time": `-${boost * 2.5}%🕣 entrainement`,
        };

        let crowinfos = "";

        const crow = pDatas.kasugai_crow === null ?
                     null
                     : require(`../../elements/kasugai_crows/${pDatas.kasugai_crow}.json`);

        if (crow !== null) {
            crowinfos += `**${crow.name}** • Rareté: **${crow.rarity}**\n`;
            crowinfos += `*Effets:*\n\`\`\`${crow.bonus.length > 0 ? `${
                crow.bonus.map(e => crows_boost[e]).join("\n")}` : "Aucun effet."
            }\`\`\``;
            crowinfos += `\nNiveau: **${crowLevel.level}** | Exp total: ⭐ **${this.client.util.intRender(crowLevel.exp, " ")}**`;
            crowinfos += `\nExp du niveau: ⭐ **${
                this.client.util.intRender(crowLevel.tempExp, " ")}**/${this.client.util.intRender(crowLevel.required, " ")
            }`;
        }
        else {
            crowinfos += "```Aucun corbeau de liaison. Essayez d'en "
                         +
                         `trouver un avec la commande \`${this.prefix}crow-bait.\`\`\`\``;
        }


        await this.ctx.reply(`Corbeau de liaison de ${user.username}`, crowinfos, "🐦", null, "outline");
    }
}

module.exports = Crow;