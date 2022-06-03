const Command = require("../../base/Command");

class Start extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["adventure", "ad"],
            args: [["option", "action à faire sur votre aventure, start/reset/delete.", true]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de gérer votre aventure.",
            examples: ["adventure start"],
            finishRequest: "ADVENTURE",
            name: "adventure",
            ownerOnly: false,
            permissions: 0,
            syntax: "adventure <option>",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (this.args[0] === "start") {
            if (pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous avez déjà commencé votre aventure.", null, null, "error");
            const msg = await this.ctx.reply("Voulez-vous vraiment commencer votre aventure ?", "Rejoignez-nous dès maintenant dans une folle aventure !", null, null, "info");
            const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);
            if (choice === "✅") {
                await this.client.playerDb.create(this.message.author.id);
                return await this.ctx.reply("Bienvenue jeune joueur !", "Vous êtes désormais un joueur du bot. Vous pouvez voir la liste des commandes à tout moment avec la commande help.", null, null, "success");
            }
            else if (choice === "❌") {
                return await this.ctx.reply("J'espère bientôt vous revoir !", "N'hésitez pas à venir me voir lorsque vous souhaitez commencer.", null, null, "info");
            }
            else if (choice === null) {
                return await this.ctx.reply("Commencer votre aventure.", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
            }
        }
        else if (this.args[0] === "delete") {
            if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous n'avez pas commencé votre aventure.", null, null, "error");
            const msg = await this.ctx.reply("Voulez-vous vraiment supprimer votre aventure ?", "Ce choix est définitif. Toutes vos données seront supprimées.", null, null, "info");
            const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);
            if (choice === "✅") {
                await this.client.playerDb.deleteAdventure(this.message.author.id);
                return await this.ctx.reply("Au revoir.", "Votre aventure a été totalement supprimée. Ce fût un plaisir de jouer avec vous !", null, null, "success");
            }
            else if (choice === "❌") {
                return await this.ctx.reply("Vous m'avez effrayé !", "Vous allez donc reprendre votre aventure. Rien n'a été supprimé", null, null, "info");
            }
            else if (choice === null) {
                return await this.ctx.reply("Supprimer votre aventure.", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
            }
        }
        else if (this.args[0] === "lang") {
            const allowedLangs = [
                "fr", "en", "es", "uk", "de",
            ];
            if (!this.args[1] || !allowedLangs.includes(this.args[1].toLowerCase())) return this.ctx.reply("Votre langue n'existe pas.", "Si vous cherchez une langue, utilisez une ci-dessous :\n\nt:flag_fr: | `fr` Je parlerai français !\nt:flag_gb: | `en` I will speak english !\nt:flag_ua: | `uk` Я буду говорити з тобою українською !\nt:flag_es: | `es` ¡Hablaré español!\nt:flag_de: | `de` Ich werde Deutsch sprechen!\n\n", null, null, "error");
            await this.client.playerDb.changeLang(this.message.author.id, this.args[1].toLowerCase());
            const flag = { "fr":":flag_fr:", "en":":flag_gb:", "es":"flag_es:", "uk": ":flag_ua:", "de": ":flag_de:" }[this.args[1].toLowerCase()];
            return await this.ctx.reply("Changement de langue effectué.", "Je parlerai désormais cette langue !", flag, "#5865f2", null);
        }
        else if (!this.args.length) {
            return await this.ctx.reply("Voici les sous-commandes.", "\nt`start`\nCommencez votre aventure dès maintenant.\n\nt`delete`\nSupprimez votre progression définitivement.\n\nt`lang`\nChangez la langue du bot.", null, null, "info");
        }
        else {
            return await this.ctx.reply("Sous-commande inconnue.", "**Veuillez réessayer avec l'une de ces commandes.**\n\nt`start`\nCommencez votre aventure dès maintenant.\n\nt`delete`\nSupprimez votre progression définitivement.\n\nt`lang`\nChangez la langue du bot.", null, null, "warning");
        }
    }
}

module.exports = new Start();