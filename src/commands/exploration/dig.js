const Command = require("../../base/Command");
const map = require("../../elements/map.js");
const convertDate = require("../../utils/convertDate");
const fs = require("fs");

class Dig extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["dig"],
            args: [],
            category: "Exploration",
            cooldown: 15,
            description: "Commande permettant de fouiller la zone où vous vous trouver afin de récolter quelques items.",
            examples: ["dig"],
            finishRequest: "ADVENTURE",
            name: "dig",
            ownerOnly: false,
            permissions: 0,
            syntax: "dig",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);
        const area = loc.Areas.filter(a => a.id === mDatas.area)?.at(0);

        const lastDig = mDatas.exploration[`${loc.id}_${area.id}`]?.lastDig ?? null;
        const timeSpent = Date.now() - (lastDig ?? 0);

        if (lastDig === null || timeSpent > 7_200_000) {
            const items = fs.readdirSync("./src/elements/materials").map(item => require(`../../elements/materials/${item}`));
            const zoneItems = items.filter(item => item.zones.includes(area.biome));

            const itemsGot = {};
            for (const obj of zoneItems) {
                const rate = Math.random() * 100;
                const gotItem = rate <= obj.rarity;

                if (gotItem) {
                    let quantity = 1;
                    let digAgain = true;

                    while (digAgain) {
                        const gotAnother = (Math.random() * 100) <= (obj.rarity * 2 / quantity);

                        if (gotAnother) {
                            quantity += Math.ceil(obj.rarity);
                        }
                        else {
                            digAgain = false;
                        }
                    }

                    itemsGot[obj.label] = quantity;
                }
            }

            let finalStr = "";
            if (Object.values(itemsGot).length === 0) {
                finalStr = "Cette fouille n'aura pas été fructueuse, vous n'avez rien obtenu. Terrible malchance !";
            }
            else {
                finalStr += "Vous avez obtenu des objets ! Jetez un œil:\n";
                const iDatas = await this.client.inventoryDb.get(this.message.author.id);

                for (const item in itemsGot) {
                    const i = zoneItems.filter(i_ => i_.label === item)?.at(0) ?? { name: "Item", emoji: "⬛" };
                    finalStr += `\n${i.emoji} **${i.name}(s)**: \`x${itemsGot[item]}\``;

                    const hadBefore = "materials" in iDatas ? (item in iDatas.materials ? iDatas.materials[item] : 0) : 0;
                    this.client.inventoryDb.db.ensure(this.message.author.id, this.client.inventoryDb.model(this.message.author.i));
                    this.client.inventoryDb.db.set(this.message.author.id, hadBefore + itemsGot[item], `materials.${item}`);
                }

                finalStr += "\n\n**Revenez dans 2h pour fouiller cette zone !**";
                this.client.mapDb.db.ensure(this.message.author.id, this.client.mapDb.model(this.message.author.i));
                this.client.mapDb.db.set(this.message.author.id, Date.now(), `exploration.${loc.id}_${area.id}.lastDig`);
            }

            await this.client.playerDb.gainExp(this.message.author.id, Math.floor(Math.random() * 150) + 100, this);
            return await this.ctx.reply("Fouiller la zone.", finalStr, "🔎", null, "outline");
        }
        else {
            return await this.ctx.reply(
                "Fouiller la zone.",
                `Il semblerait que vous ayez déjà fouillé cette zone. Revenez dans **${convertDate(7_200_000 - timeSpent, false).string}** à cet emplacement.`,
                "🔎",
                null,
                "error",
            );
        }
    }
}

module.exports = new Dig();