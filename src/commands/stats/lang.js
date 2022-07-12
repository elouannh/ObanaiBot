const Command = require("../../base/Command");

class Lang extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["lang", "lg"],
            args: [],
            category: "Stats",
            cooldown: 15,
            description: "Commande permettant de changer la langue du bot.",
            examples: ["[p]lang"],
            finishRequest: "ADVENTURE",
            name: "lang",
            ownerOnly: false,
            permissions: 0,
            syntax: "lang",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) {
            return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");
        }

        const allowedLangs = [
            "fr", "en",
        ];
        if (!this.args[0] || !allowedLangs.includes(this.args[0]?.toLowerCase() ?? "")) {
            return this.ctx.reply(
                "Votre langue n'existe pas.",
                "Si vous cherchez une langue, utilisez une ci-dessous :\n\nt:flag_fr: | `fr` Je parlerai français !\nt:flag_gb: | `en` I will speak english !\n",
                null,
                null,
                "error",
            );
        }
        await this.client.playerDb.changeLang(this.message.author.id, this.args[0].toLowerCase());
        const flag = { "fr":":flag_fr:", "en":":flag_gb:" }[this.args[0].toLowerCase()];
        return await this.ctx.reply("Changement de langue effectué.", "Je parlerai désormais cette langue !", flag, null, "outline");
    }
}

module.exports = Lang;