const Command = require("../../base/Command");

class Prefix extends Command {
    constructor() {
        super({
            category: "Utilitaire",
            cooldown: 10,
            description: "Commande permettant de changer le préfixe du bot sur votre serveur.",
            finishRequest: ["prefix"],
            name: "prefix",
            private: "none",
            permissions: 32n,
        });
    }

    async run() {
        const guildPrefix = await this.client.guildDb.get(this.message.guild.id);
        if (this.args.length > 0) {
            const isValid = await this.client.guildDb.validPrefix(this.args.join(""));

            if (isValid === null) {
                return await this.ctx.reply(
                    "Nouveau préfixe invalide.",
                    "Votre préfixe doit être de la forme suivante:"
                    +
                    "```[a-z]{0,1}?[!?.:;,]```\n```Exemples:\n- prefix d?```",
                    null,
                    null,
                    "error",
                );
            }
            const msg = await this.ctx.reply(
                "Changement de préfixe.",
                `Souhaitez-vous changer le préfixe de votre serveur ?\nLe nouveau préfixe utilisé sera \`${isValid}\``,
                null,
                null,
                "info",
            );
            const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);
            if (choice === "✅") {
                await this.client.guildDb.changePrefix(this.message.guild.id, isValid);
                return await this.ctx.reply(
                    "Changement de préfixe.",
                    "Le préfixe a bien été modifié.",
                    null,
                    null,
                    "success",
                );
            }
            else if (choice === "❌") {
                return await this.ctx.reply(
                    "Changement de préfixe.",
                    "Le préfixe n'a donc pas été modifié.",
                    null,
                    null,
                    "info",
                );
            }
            else if (choice === null) {
                return await this.ctx.reply(
                    "Changement de préfixe.",
                    "La commande n'a pas aboutie.",
                    null,
                    null,
                    "timeout",
                );
            }
        }
        else {
            return await this.ctx.reply(
                "Bonjour !",
                `Je suis Obanai. Mon préfixe sur ce serveur est \`${guildPrefix.prefix}\`. `
                +
                `Tu peux voir la liste de mes commandes en faisant \`${guildPrefix.prefix}help\`.`,
                null,
                null,
                "info",
            );
        }
    }
}

module.exports = Prefix;