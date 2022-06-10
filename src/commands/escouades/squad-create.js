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

        const msg = await this.ctx.reply("Créer une escouade.", "Souhaitez-vous vraiment créer une escouade ?\n\n**__Requis :__**```diff\n- 10.000 ¥\n- Niveau 20 requis\n- Ne pas avoir d'escouade```\n\nRépondre avec `y` (yes) ou `n` (non).", "🛡️", null, "outline");
        const choice = await this.ctx.messageCollection(msg);

        if (this.ctx.isResp(choice, "y")) {
            const pDatas = await this.client.playerDb.get(this.message.author.id);
            const playerLevel = calcPlayerLevel(pDatas.exp);
            if (pDatas.squad !== null) return await this.ctx.reply("Oups...", "Il semblerait que vous fassiez déjà parti d'une escouade.", null, null, "warning");
            if (playerLevel.level < 20) return await this.ctx.reply("Oups...", "Créer une escouade nécessite d'être niveau **20**. Revenez me voir lorsque ça sera le cas.", null, null, "warning");

            const iDatas = await this.client.inventoryDb.get(this.message.author.id);
            if (iDatas.yens < 10_000) return await this.ctx.reply("Oups...", `Vous devez récolter **10'000¥** pour créer une escouade.\n\nSolde actuel: **${iDatas.yens}**`, null, null, "info");

            const newSquad = this.client.squadDb.model(
                this.message.author.id, null, coolNameGenerator(), "Il était une fois une escouade...", null,
            );
            await this.client.squadDb.createSquad(newSquad);
            return await this.ctx.reply("Félicitationsn escouade créée !", `Votre escouade **${newSquad.name}** a bien été créée ! Vous pouvez obtenir des informations dessus en faisant la commande squad.`, "🥳", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Créer une escouade.", "Vous avez décidé de ne pas créer d'escouade.", "🛡️", null, "outline");
        }
        else {
            return await this.ctx.reply("Créer une escouade.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = new SquadCreate();