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
        const badges = pDatas.badges;

        let categories = fs.readdirSync("./src/elements/categories").map(e => require(`../../elements/categories/${e}`));
        if (!badges.includes("vip")) categories = categories.filter(cat => !cat.vip);
        const categoriesObject = {};
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        for (let i = 0; i < categories.length; i++) {
            categoriesDisplay[emojis[i]] = categories[i];
            console.log("test");
        }
    }
}

module.exports = new Category();