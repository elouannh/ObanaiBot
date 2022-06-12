const Command = require("../../base/Command");

class Grimoire extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["grimoire-unset", "grim-unset"],
            args: [],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de retirer son grimoire.",
            examples: ["grimoire-unset"],
            finishRequest: "ADVENTURE",
            name: "grimoire-unset",
            ownerOnly: false,
            permissions: 0,
            syntax: "grimoire-unset",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.inventoryDb.get(this.message.author.id);
        if (pDatas.active_grimoire === null) return await this.ctx.reply("Je ne peux pas retirer votre grimoire.", "Il semblerait qu'il n'y ait pas de grimoire actif sur votre inventaire.", null, null, "info");

        const grimDatas = require(`../../elements/grimoires/${pDatas.active_grimoire}.json`);

        let str = `Vous êtes sur le point de retirer **${grimDatas.name}** ! Retirer un grimoire le rend inutilisable ! Vous toucherez donc quelques yens en fonction de son temps restant d'utilisation en compensation.`;
        if (pDatas.active_grimoire === "eternal") str = `Vous allez retirer **${grimDatas.name}**. Ce grimoire est intemporel, et donc vous pourrez le rééquiper quand vous le souhaiterez.`;
        const msg = await this.ctx.reply("Retirer votre grimoire.", str, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);
        if (choice === "✅") {
            await this.client.inventoryDb.unequipGrimoire(this.message.author.id, this);
            return await this.ctx.reply("Votre grimoire a bien été retiré !", `Vous avez donc retiré **${grimDatas.name}**.`, null, null, "success");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Vous n'équipez rien.", `Vous avez décidé de ne pas retirer **${grimDatas.name}**.`, null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Équiper votre grimoire.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = new Grimoire();