const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class SetVipplus extends Command {
    constructor() {
        super({
            aliases: ["set-vipplus"],
            args: [["user", "utilisateur à mettre VIP(+).", true]],
            category: "Admin",
            cooldown: 7,
            description: "Commande permettant de mettre un joueur VIP(+).",
            examples: ["[p]set-vipplus @pandawou"],
            finishRequest: ["Admin"],
            name: "set-vipplus",
            private: "admins",
            permissions: 0n,
            syntax: "set-vipplus <user>",
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

        const eDatas = await this.client.externalServerDb.ensure(user.id);
        if (!eDatas.grades.includes("vip+")) {
            await this.client.externalServerDb.addVipplus(user.id, "bdd");
            this.message.react("✅");
        }
    }
}

module.exports = SetVipplus;