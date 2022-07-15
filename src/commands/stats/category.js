const Command = require("../../base/Command");
const fs = require("fs");

class Category extends Command {
    constructor() {
        super({
            aliases: ["category", "cat"],
            args: [],
            category: "Stats",
            cooldown: 15,
            description: "Commande permettant de changer de catégorie de pourfendeur.",
            examples: ["[p]category"],
            finishRequest: "ADVENTURE",
            name: "category",
            private: "none",
            permissions: 0n,
            syntax: "category",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Vous avez déjà commencé votre aventure.", null, null, "error");

        const pDatas = await this.client.playerDb.get(this.message.author.id);
        const eDatas = await this.client.externalServerDb.get(this.message.author.id);

        let categories = fs.readdirSync("./src/elements/categories").map(e => require(`../../elements/categories/${e}`));
        if (!eDatas.grades.includes("vip")) categories = categories.filter(cat => !cat.vip);

        const msg = await this.ctx.reply(
            "Changement/amélioration de catégorie.",
            "Bienvenue sur le menu des catégories !"
            +
            "Si vous désirez améliorer votre catégorie (pour augmenter les bonus), écrivez votre catégorie actuel, ainsi que votre souffle actuel **si demandé.**\n"
            +
            "Si vous désirez changer de catégorie, écrivez une catégorie différente de la votre. "
            +
            "Si vous désirez changer changer de souffle (si il y en a plusieurs dans votre catégorie), écrivez votre catégorie actuelle et ensuite un autre souffle.\n"
            +
            "\n**En cas de changement soit de souffle soit de catégorie, toute progression en amélioration sur votre catégorie sera définitivement perdue.**"
            +
            `\n\n${categories.map(e => `\`id:${e.label}\` | ${e.name}`).join("\n")}`
            +
            "\n\nRépondez ci-dessous avec l'id. Répondez avec `n` (non) pour annuler.",
            "👑",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg, 1, 60_000);

        if (categories.map(e => e.label).includes(choice)) {

            const cat = categories.filter(e => e.label === choice)?.at(0) ?? "catégorie introuvable";
            const breaths = cat?.breaths ?? [];
            let breath = breaths?.at(0);
            let good = true;

            if (breaths.length > 1) {
                const msg2 = await this.ctx.reply(
                    "Changement/amélioration de catégorie.",
                    "Plusieurs souffles existent dans votre catégorie. Lequel souhaitez-vous prendre ?\n\n"
                    +
                    `${breaths.map(e => require(`../../elements/breaths/${e}_style.json`)).map(e => `${e.emoji} \`id:${e.id}\` | ${e.name}`).join("\n")}`
                    +
                    "\n\nRépondez ci-dessous avec l'id. Répondez avec `n` (non) pour annuler.",
                    "👑",
                    null,
                    "outline",
                );
                const choice2 = await this.ctx.messageCollection(msg2);

                if (breaths.includes(choice2)) {
                    breath = choice2;
                }
                else {
                    good = false;
                }
            }

            if (!good) return await this.ctx.reply("Changement/amélioration de catégorie.", "La commande n'a pas aboutie.", null, null, "timeout");

            const iDatas = await this.client.inventoryDb.get(this.message.author.id);
            const masteries = "grimoires" in iDatas ? ("mastery" in iDatas.grimoires ? iDatas.grimoires["mastery"] : 0) : 0;

            if (masteries <= 0) return await this.ctx.reply("Oups...", "Vous n'avez pas de **Grimoire de maîtrise** en stock.", null, null, "warning");

            if (cat.label === pDatas.category && breath === pDatas.breath) {
                if (pDatas.categoryLevel === 5) return await this.ctx.reply("Oups...", "Votre catégorie est déjà au niveau maximum.", null, null, "warning");

                await this.client.playerDb.upgradeCategory(this.message.author.id, pDatas.categoryLevel);
                return await this.ctx.reply(
                    "Changement/amélioration de catégorie.",
                    `Vous avez amélioré votre catégorie. Elle passe au niveau **${pDatas.categoryLevel + 1}**`,
                    "👑",
                    null,
                    "outline",
                );
            }
            else {
                await this.client.playerDb.changeCategory(this.message.author.id, cat.label, breath);
                return await this.ctx.reply(
                    "Changement/amélioration de catégorie.",
                    `Vous avez bien changé de catégorie, vous voilà désormais dans la catégorie **${cat.name}**.`,
                    "👑",
                    null,
                    "outline",
                );
            }

        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Changement/amélioration de catégorie.", "Vous avez décidé de ne pas changer de catégorie, ou de l'améliorer.", "👑", null, "outline");
        }
        else {
            return await this.ctx.reply("Changement/amélioration de catégorie.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = Category;