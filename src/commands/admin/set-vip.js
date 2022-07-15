const Command = require("../../base/Command");
const MemberScanning = require("../../structure/tools/MemberScanning");

class SetVip extends Command {
    constructor() {
        super({
            aliases: ["set-vip"],
            args: [["user", "utilisateur à mettre VIP.", true]],
            category: "Admin",
            cooldown: 7,
            description: "Commande permettant de mettre un joueur VIP.",
            examples: ["[p]set-vip @pandawou"],
            finishRequest: ["Admin"],
            name: "set-vip",
            private: "admins",
            permissions: 0n,
            syntax: "set-vip <user>",
        });
    }

    async run() {
        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;

        const pExists = await this.client.playerDb.started(user.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const eDatas = await this.client.externalServerDb.ensure(user.id);
        if (!eDatas.grades.includes("vip")) {
            await this.client.externalServerDb.addVip(user.id, "bdd");
            this.message.react("✅");
        }
    }
}

module.exports = SetVip;