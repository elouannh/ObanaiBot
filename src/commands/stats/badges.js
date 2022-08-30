const Command = require("../../base/Command");


class Badges extends Command {
    constructor() {
        super({
            category: "Stats",
            cooldown: 7,
            description: "Commande permettant de voir ses badges de pourfendeur.",
            finishRequest: "ADVENTURE",
            name: "badges",
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

        const eDatas = await this.client.externalServerDb.get(user.id);

        let badges = "";

        badges += "\n\n**Badges & Grades**\n\n";
        badges += `🚜 **Fermier** ${
            this.client.externalServerDb.getProgress("farmer", eDatas.badges.farmer.value, "maximal")
        }\n\n`;
        badges += `🗺️ **Aventurier** ${
            this.client.externalServerDb.getProgress("adventurer", eDatas.badges.adventurer.value, "maximal")
        }\n\n`;
        badges += `💀 **Dominateur** ${
            this.client.externalServerDb.getProgress("domineering", eDatas.badges.domineering.value, "maximal")
        }\n\n`;
        badges += `⛩️ **Chef de guerre** ${
            this.client.externalServerDb.getProgress("warChief", eDatas.badges.warChief.value, "maximal")
        }\n\n`;
        badges += `🔎 **Archéologue** ${
            this.client.externalServerDb.getProgress("archaeologist", eDatas.badges.archaeologist.value, "maximal")
        }\n\n`;
        badges += `🦅 **Maître fauconnier** ${
            this.client.externalServerDb.getProgress("masterFalconer", eDatas.badges.masterFalconer.value, "maximal")
        }`;

        await this.ctx.reply(`Badges de ${user.username}`, badges, "🎖️", null, "outline");
    }
}

module.exports = Badges;