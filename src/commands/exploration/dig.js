const Command = require("../../base/Command");
const map = require("../../elements/map.js");
const convertDate = require("../../utils/convertDate");
const fs = require("fs");

class Bag {
    constructor() {
        this.elements = {};
    }

    get size() {
        return Object.entries(this.elements).map(e => require(`../../elements/materials/${e[0]}.json`).size).reduce((a, b) => a + b, 0);
    }

    addItem(item, amount) {
        if (item in this.elements) this.elements[item] += amount;
        else this.elements[item] = amount;
    }
}

class Dig extends Command {
    constructor() {
        super({
            aliases: ["dig"],
            args: [],
            category: "Exploration",
            cooldown: 5,
            description: "Commande permettant de fouiller la zone où vous vous trouver afin de récolter quelques items.",
            examples: ["[p]dig"],
            finishRequest: "ADVENTURE",
            name: "dig",
            private: "none",
            permissions: 0n,
            syntax: "dig",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        let iDatas = await this.client.inventoryDb.get(this.message.author.id);
        const eDatas = await this.client.externalServerDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);
        const area = loc.Areas.filter(a => a.id === mDatas.area)?.at(0);
        const aDatas = await this.client.activityDb.get(this.message.author.id);

        if (aDatas.isTravelling) {
            const timeLeft = aDatas.travelling.start + aDatas.travelling.duration - Date.now();
            if (timeLeft > 0) {
                const loc_ = map.Regions.filter(r => r.id === Number(aDatas.travelling.destination.split("_")[0]))?.at(0);
                const destName = `${loc_.name} - ${loc_.Areas.filter(ar => ar.id === Number(aDatas.travelling.destination.split("_")[1])).at(0).name}`;
                return await this.ctx.reply(
                    "Voyage (intrarégional).",
                    "Il semblerait que vous êtes déjà en train de voyager ! Voici plus d'informations :\n"
                    +
                    `\`\`\`Destination: ${destName}\nTemps restant: ${convertDate(timeLeft).string}\`\`\``,
                    "🧳",
                    null,
                    "outline",
                );
            }
            else {
                const loc_ = map.Regions.filter(r => r.id === Number(aDatas.travelling.destination.split("_")[0]))?.at(0);
                const destName = `${loc_.name} - ${loc_.Areas.filter(ar => ar.id === Number(aDatas.travelling.destination.split("_")[1])).at(0).name}`;
                await this.client.activityDb.endOfTrip(this.message.author.id, this);
                return await this.ctx.reply("Voyage (intrarégional).", `Vous voilà arrivé à: **${destName}**. Passez un bon séjour !`, "🗺️", null, "outline");
            }
        }

        const lastDig = mDatas.exploration[`${loc.id}_${area.id}`]?.lastDig ?? null;
        const timeSpent = Date.now() - (lastDig ?? 0);

        if (lastDig === null || timeSpent > 7_200_000) {
            let luck = 1;

            if (iDatas.active_grimoire !== null) {
                const grim = require(`../../elements/grimoires/${iDatas.active_grimoire}.json`);
                if (grim.benefits.includes("loot_rate_boost")) luck += (grim.boost - 1);
            }

            const items = fs.readdirSync("./src/elements/materials").map(item => require(`../../elements/materials/${item}`));
            const areaItems = items.filter(item => item.areas.includes(area.biome));

            const bag = new Bag();
            const bagSize = eDatas.grades.includes("vip") ? 300 : 200;
            const gotItems = areaItems.filter(e => (Math.random() * 100 / luck) < e.rarity).sort((a, b) => b.size - a.size);

            for (const item of gotItems) {
                const itemMax = Math.floor((bagSize - bag.size) / item.size);
                if (itemMax >= 1) bag.addItem(item.label, Math.floor(Math.random() * (itemMax - 1)) + 1);
            }

            const itemsGot = bag.elements;

            let finalStr = "";
            if (Object.values(itemsGot).length === 0) {
                finalStr = "Cette fouille n'aura pas été fructueuse, vous n'avez rien obtenu. Terrible malchance !";
                this.client.mapDb.db.ensure(this.message.author.id, this.client.mapDb.model(this.message.author.i));
                this.client.mapDb.db.set(this.message.author.id, Date.now(), `exploration.${loc.id}_${area.id}.lastDig`);
            }
            else {
                finalStr += "Vous avez obtenu des objets ! Jetez un œil:\n";
                iDatas = await this.client.inventoryDb.get(this.message.author.id);

                for (const item in itemsGot) {
                    const i = areaItems.filter(i_ => i_.label === item)?.at(0) ?? { name: "Item", emoji: "⬛" };
                    finalStr += `\n${i.emoji} **${i.name}(s)**: \`x${itemsGot[item]}\``;

                    const hadBefore = "materials" in iDatas ? (item in iDatas.materials ? iDatas.materials[item] : 0) : 0;
                    this.client.inventoryDb.db.ensure(this.message.author.id, this.client.inventoryDb.model(this.message.author.i));
                    this.client.inventoryDb.db.set(this.message.author.id, hadBefore + itemsGot[item], `materials.${item}`);
                }

                // BADGE
                await this.client.externalServerDb.checkBadges(this.message.author.id, "archaeologist", 1);
                //

                finalStr += "\n\n**Revenez dans 2h pour fouiller cette zone !**";
                this.client.mapDb.db.ensure(this.message.author.id, this.client.mapDb.model(this.message.author.i));
                this.client.mapDb.db.set(this.message.author.id, Date.now(), `exploration.${loc.id}_${area.id}.lastDig`);
            }

            await this.client.playerDb.earnExp(this.message.author.id, Math.floor(Math.random() * 150) + 100, this);
            return await this.ctx.reply("Fouiller la zone.", finalStr, "🔎", null, "outline");
        }
        else {
            return await this.ctx.reply(
                "Fouiller la zone.",
                `Il semblerait que vous ayez déjà fouillé cette zone. Revenez dans **${convertDate(7_200_000 - (lastDig === null ? 0 : timeSpent), false).string}** à cet emplacement.`,
                "🔎",
                null,
                "error",
            );
        }
    }
}

module.exports = Dig;