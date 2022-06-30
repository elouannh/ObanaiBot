const Command = require("../../base/Command");
const Arena = require("../../classes/Arena");
const Player = require("../../classes/Player");
const MemberScanning = require("../../structure/tools/MemberScanning");

class Fight extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["fight", "f"],
            args: [["player", "joueur que vous souhaitez affronter.", false]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de se battre contre un pourfendeur.",
            examples: ["fight @pandawou"],
            finishRequest: "ADVENTURE",
            name: "fight",
            ownerOnly: false,
            permissions: 0,
            syntax: "fight <?player>",
        });
    }

    async run() {
        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;

        const pExists = await this.client.playerDb.started(user.id);
        const p2Exists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");
        if (!p2Exists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");


        const arena = new Arena(
            this,
            [
                new Player(this.message.author.id, this.message.author.username, this.message.author),
            ],
            [
                new Player(user.id, user.username, user),
            ],
        );

        await arena.init();
        await arena.begin();
    }
}

module.exports = new Fight();