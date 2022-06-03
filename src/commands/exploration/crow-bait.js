const Command = require("../../base/Command");
const map = require("../../elements/map");
const fs = require("fs");
const calcCrowLevel = require("../../elements/calcCrowLevel");

class CrowBait extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["crow-bait", "cb"],
            args: [],
            category: "Exploration",
            cooldown: 5,
            description: "Commande permettant de tenter d'appâter des oiseaux à proximiter afin d'avoir un corbeau de liaison.",
            examples: ["crow-bait"],
            finishRequest: "ADVENTURE",
            name: "crow-bait",
            ownerOnly: false,
            permissions: 0,
            syntax: "crow-bait",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);
        const zone = loc.Areas.filter(a => a.id === mDatas.area)?.at(0);


        if (!["meadow", "forest", "dark_forest"].includes(zone.biome)) {
            let cantBait = "Vous ne vous trouvez pas dans une zone où des oiseaux se trouvent.";
            const goodZones = [];
            for (const z of map.Regions.filter(r => r.accesses.includes(loc.id))) {
                const tempoString = [];
                for (const a of z.Areas.filter(at => ["meadow", "forest", "dark_forest"].includes(at.biome))) tempoString.push(`${a.name}`);

                if (tempoString.length > 0) {
                    goodZones.push(`${z.emoji} **${z.name}** - ${tempoString.join(", ")}`);
                }
            }
            if (goodZones.length > 0) cantBait += `\n\n**Zones conseillées à proximité:**\n${goodZones.map((e, i) => `**${i + 1}**. ${e}`).join("\n")}`;
            return await this.ctx.reply("Appât d'oiseaux", cantBait, null, null, "info");
        }

        const iDatas = await this.client.inventoryDb.get(this.message.author.id);

        const seeds = "materials" in iDatas ? ("seed" in iDatas.materials ? iDatas.materials.seed : 0) : 0;
        const worms = "materials" in iDatas ? ("worm" in iDatas.materials ? iDatas.materials.worm : 0) : 0;

        if (seeds < 100) return await this.ctx.reply("Appât d'oiseaux", `Vous n'avez pas assez de graines.\n**Graines requises: ${seeds}/100**`, null, null, "error");
        if (worms < 10) return await this.ctx.reply("Appât d'oiseaux", `Vous n'avez pas assez de vers de terre.\n**Vers requis: ${worms}/10**`, null, null, "error");

        await this.ctx.reply("Appât d'oiseaux", "Vous tentez d'appâter des oiseaux aux alentours...", null, null, "info");
        this.client.inventoryDb.db.set(this.message.author.id, seeds - 100, "materials.seed");
        this.client.inventoryDb.db.set(this.message.author.id, worms - 10, "materials.worm");

        const birdFound = Math.floor(Math.random() * 100) > 80;
        if (!birdFound) {
            const resp = [
                "Après quelques minutes, un oiseau pointa son bec. Cependant, il avait l'air bien trop frêle pour servir de corbeau messager...",
                "Après quelques minutes, toujours aucun oiseau... L'appât n'a servi a rien.",
                "Après quelques minutes, des rongeurs commencent à venir grignoter votre appât. Ce n'est pas vraiment l'animal que vous souhaitiez rencontrer...",
            ];

            return await this.ctx.reply("Appât d'oiseaux", resp[Math.floor(Math.random() * resp.length)], null, null, "info");
        }

        function luck(count = 0) {
            if ((Math.random() * 100) < (100 / (count + 1)) && count < 5) return luck(count + 1);
            return count;
        }

        const rarity = luck();
        const kasugais = fs.readdirSync("./src/elements/kasugai_crows").map(e => require(`../../elements/kasugai_crows/${e}`)).filter(e => e.rarity === rarity);
        const kasugai = kasugais[Math.floor(Math.random() * kasugais.length)];

        const [actualCrow, actualCrowLevel] = [iDatas.kasugai_crow === null ? null : require(`../../elements/kasugai_crows/${iDatas.kasugai_crow}`), calcCrowLevel(iDatas.kasugai_crow_exp)];
        const supStr = `${actualCrow === null ? "Voulez-vous le récupérer et en faire votre oiseau ?" : `Vous avez déjà **${actualCrow.name}**, niveau **${actualCrowLevel.level} (${actualCrowLevel.exp} exp)**, voulez-vous le remplacer ? Toute progression en niveaux de corbeau sera perdue.`}`;
        const msg = await this.ctx.reply("Oh, un oiseau est apparu !", `L'oiseau suivant s'est fait avoir par votre appât: **${kasugai.name}**\n\n${supStr}`, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, ["❌", "✅"]);

        if (choice === "❌") {
            return await this.ctx.reply("Appât d'oiseaux", "Vous avez décidé de ne pas récupérer l'oiseau.", null, null, "info");
        }
        else if (choice === null) {
            return await this.ctx.reply("Appât d'oiseaux", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }
        else if (choice === "✅") {
            this.client.inventoryDb.changeCrow(this.message.author.id, kasugai.label);
            return await this.ctx.reply("Appât d'oiseaux", `Vous avez donc apprivoisé **${kasugai.name}** !`, null, null, "info");
        }
    }
}

module.exports = new CrowBait();