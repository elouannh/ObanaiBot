const Command = require("../../base/Command");
const map = require("../../elements/map");
const fs = require("fs");
const calcCrowLevel = require("../../elements/calcCrowLevel");

class CrowBait extends Command {
    constructor() {
        super({
            aliases: ["crow-bait", "cb"],
            args: [],
            category: "Exploration",
            cooldown: 10,
            description: "Commande permettant de tenter d'appâter des oiseaux à proximiter afin d'obtenir un corbeau de liaison.",
            examples: ["[p]crow-bait"],
            finishRequest: "ADVENTURE",
            name: "crow-bait",
            private: "none",
            permissions: 0,
            syntax: "crow-bait",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);
        const area = loc.Areas.filter(a => a.id === mDatas.area)?.at(0);


        if (!["meadow", "forest", "dark_forest"].includes(area.biome)) {
            let cantBait = "Vous ne vous trouvez pas dans une zone où des oiseaux se trouvent.";
            const goodAreas = [];
            for (const z of map.Regions.filter(r => r.accesses.includes(loc.id))) {
                const tempoString = [];
                for (const a of z.Areas.filter(at => ["meadow", "forest", "dark_forest"].includes(at.biome))) tempoString.push(`${a.name}`);

                if (tempoString.length > 0) {
                    goodAreas.push(`${z.emoji} **${z.name}** - ${tempoString.join(", ")}`);
                }
            }
            if (goodAreas.length > 0) cantBait += `\n\n**Zones conseillées à proximité:**\n${goodAreas.map((e, i) => `**${i + 1}**. ${e}`).join("\n")}`;
            return await this.ctx.reply("Appâtage d'oiseaux.", cantBait, "🐦", null, "outline");
        }

        const iDatas = await this.client.inventoryDb.get(this.message.author.id);

        const seeds = "materials" in iDatas ? ("seed" in iDatas.materials ? iDatas.materials.seed : 0) : 0;
        const worms = "materials" in iDatas ? ("worm" in iDatas.materials ? iDatas.materials.worm : 0) : 0;

        if (seeds < 100) return await this.ctx.reply("Oups...", `Vous n'avez pas assez de graines.\n**Graines requises: ${seeds}/100**`, null, null, "warning");
        if (worms < 25) return await this.ctx.reply("Oups...", `Vous n'avez pas assez de vers de terre.\n**Vers requis: ${worms}/25**`, null, null, "warning");

        await this.ctx.reply("Appâtage d'oiseaux.", "Vous tentez d'appâter des oiseaux aux alentours... Voyons voir...", "🐦", null, "outline");
        this.client.inventoryDb.db.set(this.message.author.id, seeds - 100, "materials.seed");
        this.client.inventoryDb.db.set(this.message.author.id, worms - 25, "materials.worm");

        const birdFound = Math.floor(Math.random() * 100) > 50;
        if (!birdFound) {
            const resp = [
                "Après quelques minutes, un oiseau pointa son bec. Cependant, il avait l'air bien trop frêle pour servir de corbeau messager...",
                "Après quelques minutes, toujours aucun oiseau... L'appât n'a servi a rien.",
                "Après quelques minutes, des rongeurs commencent à venir grignoter votre appât. Ce n'est pas vraiment l'animal que vous souhaitiez rencontrer...",
            ];

            return await this.ctx.reply("Appâtage d'oiseaux.", resp[Math.floor(Math.random() * resp.length)], "🐦", null, "error");
        }
        // BADGE
        await this.client.externalServerDb.checkBadges(this.message.author.id, "masterFalconer", 1);
        //

        function luck(x = 1, count = 0) {
            if (((Math.random() * 100) / x) < (100 / (count + 1)) && count < 5) return luck(x, count + 1);
            return count;
        }

        let y = 1;

        if (iDatas.active_grimoire !== null) {
            const grim = require(`../../elements/grimoires/${iDatas.active_grimoire}.json`);
            if (grim.benefits.includes("kasugai_crows_rarity_boost")) y += (grim.boost - 1);
        }

        const rarity = luck(y);
        const kasugais = fs.readdirSync("./src/elements/kasugai_crows").map(e => require(`../../elements/kasugai_crows/${e}`)).filter(e => e.rarity === rarity);
        const kasugai = kasugais[Math.floor(Math.random() * kasugais.length)];

        const [actualCrow, actualCrowLevel] = [
            iDatas.kasugai_crow === null ? null : require(`../../elements/kasugai_crows/${iDatas.kasugai_crow}`), calcCrowLevel(iDatas.kasugai_crow_exp),
        ];
        const supStr = `${
            actualCrow === null ? "Voulez-vous le récupérer et en faire votre oiseau ?"
            : `Vous avez déjà **${actualCrow.name}** (Rareté: ${"💎".repeat(actualCrow.rarity)}${"⚫".repeat(5 - actualCrow.rarity)}), niveau **${actualCrowLevel.level} `
              +
              `(${actualCrowLevel.exp} exp)**, voulez-vous le remplacer ? Toute progression en niveaux de corbeau sera perdue.`}`;
        const msg = await this.ctx.reply(
            "Appâtage d'oiseaux.",
            `L'oiseau suivant s'est fait avoir par votre appât: **${kasugai.name}** `
            +
            `(Rareté: ${"💎".repeat(kasugai.rarity)}${"⚫".repeat(5 - kasugai.rarity)})\n\n${supStr}\n\nRépondre avec \`y\` (oui) ou \`n\` (non).`,
            "🐦",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg);

        if (this.ctx.isResp(choice, "y")) {
            this.client.inventoryDb.changeCrow(this.message.author.id, kasugai.label);
            return await this.ctx.reply("Appâtage d'oiseaux.", `Vous avez donc apprivoisé **${kasugai.name}** !`, "🐦", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Appeâtage d'oiseaux.", "Vous avez décidé de ne pas récupérer l'oiseau.", "🐦", null, "outline");
        }
        else {
            return await this.ctx.reply("Appâtage d'oiseaux.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = CrowBait;