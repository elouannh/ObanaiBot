const Command = require("../../base/Command");
const map = require("../../elements/map.js");
const convertDate = require("../../utils/convertDate");

class TravelArea extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["travel-area", "ta"],
            args: [],
            category: "Exploration",
            cooldown: 15,
            description: "Commande permettant de voyager à travers les régions du monde.",
            examples: ["travel-area"],
            finishRequest: "ADVENTURE",
            name: "travel-area",
            ownerOnly: false,
            permissions: 0,
            syntax: "travel-area",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const aDatas = await this.client.activityDb.get(this.message.author.id);

        if (aDatas.isTravelling) {
            const timeLeft = aDatas.travelling.start + aDatas.travelling.duration - Date.now();
            if (timeLeft > 0) {
                const loc = map.Regions.filter(r => r.id === Number(aDatas.travelling.destination.split("_")[0]))?.at(0);
                const destName = `${loc.name} - ${loc.Areas.filter(ar => ar.default).at(0).name}`;
                return await this.ctx.reply(
                    "Voyage.",
                    "Il semblerait que vous êtes déjà en train de voyager ! Voici plus d'informations :\n"
                    +
                    `\`\`\`Destination: ${destName}\nTemps restant: ${convertDate(timeLeft).string}\`\`\``,
                    "🧳",
                    null,
                    "outline",
                );
            }
            else {
                const loc = map.Regions.filter(r => r.id === Number(aDatas.travelling.destination.split("_")[0]))?.at(0);
                const destName = `${loc.name} - ${loc.Areas.filter(ar => ar.default).at(0).name}`;
                await this.client.activityDb.endOfTrip(this.message.author.id);
                await this.client.playerDb.gainExp(this.message.author.id, Math.floor(Math.random() * 150) + 100, this);
                return await this.ctx.reply("Voyage.", `Vous voilà arrivé à: **${destName}**. Passez un bon séjour !`, "🗺️", null, "outline");
            }
        }
        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);

        const dist = (x, y, x_, y_) => Math.ceil(Math.sqrt(Math.pow(x_ - x, 2) + Math.pow(y_ - y, 2)));

        const accessibleRegions = map.Regions.filter(r => r.accesses.includes(loc.id));
        const r = {};
        let str = "";

        for (let i = 0; i < accessibleRegions.length; i++) {
            const reg = accessibleRegions.at(i);
            const timeInMinutes = dist(reg.x, loc.x, reg.y, loc.y);

            const dis = await this.client.activityDb.travellingTime(this.message.author.id, Math.ceil(timeInMinutes));
            str += `\`${String(i + 1)}\` • ${reg.name} | 🕣 ${convertDate(dis, true).string}\n`;
            reg["distance"] = dis;
            r[String(i)] = reg;
        }

        str += "\nLorsque vous répondrez à ce message, vous partirez directement en voyage !\n\nRépondre avec le numéro correspondant à votre choix de destination.";
        str += "Répondre `n` (non) pour annuler.";

        const msg = await this.ctx.reply("Voyage.", str, "🧳", null, "outline");
        const choice = await this.ctx.messageCollection(msg);

        if (Object.keys(r).includes(choice)) {

            const reg = r[choice];
            const destName = `${reg.name} - ${reg.Areas.filter(ar => ar.default).at(0).name}`;
            const destCode = `${reg.id}_${reg.Areas.filter(ar => ar.default).at(0).id}`;
            await this.client.activityDb.travels(this.message.author.id, reg.distance, destCode);
            return await this.ctx.reply(
                "Voyage.",
                `Vous voilà parti à l'aventure dans la zone de **${destName}** !` + " Faites la commande !travel ou !travel-zone pour voir dans combien de temps vous arrivez.",
                "🧳",
                null,
                "outline",
            );
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Voyage.", "Vous avez décidé de ne pas voyager.", "🧳", null, "outline");
        }
        else {
            return await this.ctx.reply("Voyage.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = new TravelArea();