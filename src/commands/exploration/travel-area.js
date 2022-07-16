const Command = require("../../base/Command");
const map = require("../../elements/map.js");
const convertDate = require("../../utils/convertDate");

class TravelArea extends Command {
    constructor() {
        super({
            aliases: ["travel-area", "ta"],
            args: [],
            category: "Exploration",
            cooldown: 15,
            description: "Commande permettant de voyager d'une zone à l'autre dans votre région.",
            examples: ["[p]travel-area"],
            finishRequest: "ADVENTURE",
            name: "travel-area",
            private: "none",
            permissions: 0n,
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
                const destName = `${loc.name} - ${loc.Areas.filter(ar => ar.id === Number(aDatas.travelling.destination.split("_")[1])).at(0).name}`;
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
                const loc = map.Regions.filter(r => r.id === Number(aDatas.travelling.destination.split("_")[0]))?.at(0);
                const destName = `${loc.name} - ${loc.Areas.filter(ar => ar.id === Number(aDatas.travelling.destination.split("_")[1])).at(0).name}`;
                await this.client.activityDb.endOfTrip(this.message.author.id, this);
                return await this.ctx.reply("Voyage (intrarégional).", `Vous voilà arrivé à: **${destName}**. Passez un bon séjour !`, "🗺️", null, "outline");
            }
        }
        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);

        const areas = loc.Areas.filter(a => a.id !== mDatas.area);
        const r = {};
        let str = "";

        for (let i = 0; i < areas.length; i++) {
            const zo = areas.at(i);

            const dis = await this.client.activityDb.travellingTime(this.message.author.id, Math.ceil(2));
            str += `\`${i + 1}\` • ${zo.name} | 🕣 ${convertDate(dis, true).string}\n`;
            zo["distance"] = dis;
            r[String(i + 1)] = zo;
        }

        str += "\nLorsque vous répondrez à ce message, vous partirez directement en voyage !\n\nRépondre avec le numéro correspondant à votre choix de destination.";
        str += "Répondre `n` (non) pour annuler.";

        const msg = await this.ctx.reply("Voyage (intrarégional).", str, "🧳", null, "outline");
        const choice = await this.ctx.messageCollection(msg);

        if (Object.keys(r).includes(choice)) {

            const zo = r[choice];
            const destName = `${loc.name} - ${zo.name}`;
            const destCode = `${loc.id}_${zo.id}`;
            await this.client.activityDb.travels(this.message.author.id, zo.distance, destCode);
            return await this.ctx.reply(
                "Voyage (intrarégional).",
                `Vous voilà parti à l'aventure dans la zone de **${destName}** !`
                +
                ` Faites la commande \`${this.prefix}travel-area\` ou \`${this.prefix}travel-region\` pour voir dans combien de temps vous arrivez.`,
                "🧳",
                null,
                "outline",
            );
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("Voyage (intrarégional).", "Vous avez décidé de ne pas voyager.", "🧳", null, "outline");
        }
        else {
            return await this.ctx.reply("Voyage (intrarégional).", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = TravelArea;