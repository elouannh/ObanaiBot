const Command = require("../../base/Command");

class Grimoire extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["grimoire-set", "grim-set"],
            args: [],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant d'équiper un grimoire.",
            examples: ["grimoire-set"],
            finishRequest: "ADVENTURE",
            name: "grimoire-set",
            ownerOnly: false,
            permissions: 0,
            syntax: "grimoire-set",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const pDatas = await this.client.inventoryDb.get(this.message.author.id);

        if (pDatas.active_grimoire !== null) return await this.ctx.reply("Je ne peux pas équiper votre grimoire.", "Il semblerait qu'il y ait déjà un grimoire actif sur votre inventaire. Commencez par le retirer !", null, null, "info");

        const emojis = {
            "adventurer": "🗺️",
            "economist": "💰",
            "eternal": "🪐",
            "falconer": "🦅",
            "fortunate": "🍀",
            "warrior": "🔥",
        };

        const grimoires = Object.entries(pDatas.grimoires).filter(g => g[1] > 0).filter(g => g[0] !== "mastery").map(e => [require(`../../elements/grimoires/${e[0]}.json`), emojis[e[0]], e[1]]);
        const str = `${grimoires.map(g => `${g[1]} **• ${g[0].name}** (\`x${g[2]}\`)`).join("\n")}`;
        const msg = await this.ctx.reply("Choix du grimoire à équiper.", str, null, null, "info");
        const l = grimoires.map(e => e[1]);
        l.push("❌");
        const choice = await this.ctx.reactionCollection(msg, l);

        if (choice === null) return await this.ctx.reply("Équiper votre grimoire.", "La commande n'a pas aboutie.", null, null, "timeout");
        if (choice === "❌") return await this.ctx.reply("Équiper votre grimoire.", "Vous avez refusé d'équiper un grimoire.", null, null, "info");
        const grimDatas = grimoires.filter(g => g[1] === choice)?.at(0)?.at(0);

        const msg2 = await this.ctx.reply("Équiper votre grimoire.", `Vous êtes sur le point d'équiper **${grimDatas.name}** ! Cette action est irréversible, et vous ne pourrez pas être remboursé intégralement. Êtes vous sûr ?`, null, null, "info");
        const choice2 = await this.ctx.reactionCollection(msg2, ["❌", "✅"]);
        if (choice2 === "✅") {
            await this.client.inventoryDb.equipGrimoire(this.message.author.id, grimDatas.label);
            return await this.ctx.reply("Votre grimoire a bien été équipé !", `Vous avez donc équipé **${grimDatas.name}**.`, null, null, "success");
        }
        else if (choice2 === "❌") {
            return await this.ctx.reply("Vous n'équipez rien.", `Vous avez décidé de ne pas équiper **${grimDatas.name}**.`, null, null, "info");
        }
        else if (choice2 === null) {
            return await this.ctx.reply("Équiper votre grimoire.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = new Grimoire();