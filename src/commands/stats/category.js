const Command = require("../../base/Command");
const fs = require("fs");

class Category extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["category", "cat"],
            args: [],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de changer de catégorie de pourfendeur.",
            examples: ["category"],
            finishRequest: "ADVENTURE",
            name: "category",
            ownerOnly: false,
            permissions: 0,
            syntax: "category",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous avez déjà commencé votre aventure.", null, null, "error");

        const pDatas = await this.client.playerDb.get(this.message.author.id);
        const grades = pDatas.grades;

        let categories = fs.readdirSync("./src/elements/categories").map(e => require(`../../elements/categories/${e}`));
        if (!grades.includes("vip")) categories = categories.filter(cat => !cat.vip);

        const msg = await this.ctx.reply(
            "Changement de catégorie.",
            "En changeant de catégorie, vous perdrez toute votre progression sur cette dernière ! Entrez l'id de la catégorie à choisir."
            +
            `\n\n${categories.map(e => `\`id:${e.label}\` | ${e.name}`).join("\n")}`
            +
            "\n\nRépondez ci-dessous avec l'id. Répondez avec `n` (non) pour annuler.",
            "👑",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        if (categories.map(e => e.label).includes(choice)) {
            const cat = categories.filter(e => e.label === choice)?.at(0) ?? "catégorie introuvable";
            const iDatas = await this.client.inventoryDb.get(this.message.author.id);

            const masteries = "grimoires" in iDatas ? ("mastery" in iDatas.grimoires ? iDatas.grimoires["mastery"] : 0) : 0;

            if (masteries <= 0) return await this.ctx.reply("Oups...", "Vous n'avez pas de **Grimoire de maîtrise** en stock.", null, null, "warning");
            await this.client.inventoryDb.changeCategory(this.message.author.id, cat.label);
            return await this.ctx.reply("Changement de catégorie.", `Vous avez bien changé de catégorie, vous voilà désormais dans la catégorie **${cat.name}**.`, "👑", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Changement de catégorie.", "Vous avez décidé de ne pas changer de catégorie", "👑", null, "outline");
        }
        else {
            return await this.ctx.reply("Changement de catégorie.", "Il semblerait que vous soyez afk, ou bien que vous n'ayez pas répondu comme il faut.", null, null, "timeout");
        }
    }
}

module.exports = new Category();