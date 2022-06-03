const Command = require("../../base/Command");
const calcPlayerLevel = require("../../elements/calcPlayerLevel");
const coolNameGenerator = require("../../utils/coolNameGenerator");

class SquadCreate extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["squad-create", "sq-cr"],
            args: [],
            category: "Escouades",
            cooldown: 10,
            description: "Commande permettant de créer son escouade.",
            examples: ["squad-create"],
            finishRequest: "ADVENTURE",
            name: "squad-create",
            ownerOnly: false,
            permissions: 0,
            syntax: "squad-create",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const msg = await this.ctx.reply("Créer une escouade.", "Souhaitez-vous vraiment créer une escouade ? Il est possible de supprimer son escouade seulement 30j après sa création. Réfléchissez-y bien !", null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);

        if (choice === "✅") {
            const pDatas = await this.client.playerDb.get(this.message.author.id);
            const playerLevel = calcPlayerLevel(pDatas.exp);
            if (pDatas.squad !== null) return await this.ctx.reply("Vous avez déjà une escouade.", "Il semblerait que vous fassiez déjà parti d'une escouade.", null, null, "info");
            if (playerLevel.level < 20) return await this.ctx.reply("Vous ne pouvez pas créer d'escouade.", "Créer une escouade nécessite être niveau **20**. Revenez me voir lorsque ça sera le cas.", null, null, "info");

            const iDatas = await this.client.inventoryDb.get(this.message.author.id);
            if (iDatas.yens < 10_000) return await this.ctx.reply("Vous ne pouvez pas créer d'escouade.", `Vous devez récolter **10'000¥** pour créer une escouade.\n\nSolde actuel: **${iDatas.yens}**`, null, null, "info");

            const newSquad = this.client.squadDb.model(
                this.message.author.id, null, coolNameGenerator(), "Il était une fois une escouade...", null,
            );
            await this.client.squadDb.createSquad(newSquad);
            return await this.ctx.reply("Escouade créée !", `Votre escouade **${newSquad.name}** a bien été créée !`, null, null, "success");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Créer une escouade.", "Vous avez décidé de ne pas créer d'escouade.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Créer une escouade.", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }
    }
}

module.exports = new SquadCreate();