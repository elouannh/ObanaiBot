const Command = require("../../base/Command");
const map = require("../../elements/map.js");
const convertDate = require("../../utils/convertDate");

class TravelZone extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["travel-zone", "tr-zone"],
            args: [],
            category: "Exploration",
            cooldown: 10,
            description: "Commande permettant de voyager d'une zone à l'autre dans votre région.",
            examples: ["travel-zone"],
            finishRequest: "ADVENTURE",
            name: "travel-zone",
            ownerOnly: false,
            permissions: 0,
            syntax: "travel-zone",
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
                return await this.ctx.reply("Vous voyagez déjà.", `Il semblerait que vous êtes déjà en train de voyager ! Voici plus d'informations :\n\`\`\`Destination: ${destName}\nTemps restant: ${convertDate(timeLeft).string}\`\`\``, null, null, "outline");
            }
            else {
                const loc = map.Regions.filter(r => r.id === Number(aDatas.travelling.destination.split("_")[0]))?.at(0);
                const destName = `${loc.name} - ${loc.Areas.filter(ar => ar.default).at(0).name}`;
                await this.client.activityDb.endOfTrip(this.message.author.id);
                await this.client.playerDb.gainExp(this.message.author.id, Math.floor(Math.random() * 150) + 100, this);
                return await this.ctx.reply("Bienvenue à destination !", `Vous voilà arrivé à: **${destName}**. Passez un bon séjour !`, null, null, "success");
            }
        }
        const mDatas = await this.client.mapDb.get(this.message.author.id);
        const loc = map.Regions.filter(r => r.id === mDatas.region)?.at(0);

        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        const zones = loc.Areas.filter(a => a.id !== mDatas.area);
        const r = {};
        let str = "";

        const limit = zones.length < emojis.length ? zones.length : emojis.length;
        for (let i = 0; i < limit; i++) {
            const zo = zones.at(i);

            const dis = await this.client.activityDb.travellingTime(this.message.author.id, Math.ceil(10));
            str += `\`${emojis.at(i)}\` • ${zo.name} | 🕣 ${convertDate(dis, true).string}\n`;
            zo["distance"] = dis;
            r[emojis.at(i)] = zo;
        }
        const l = emojis.slice(0, zones.length);
        l.push("❌");
        const msg = await this.ctx.reply("Choix de votre destination.", str, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, l);

        if (choice === null) {
            return await this.ctx.reply("Choix de votre destination.", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }
        else if (choice === "❌") {
            return await this.ctx.reply("Choix de votre destination.", "Vous avez décidé de ne pas voyager.", null, null, "info");
        }
        else {
            const zo = r[choice];
            const destName = `${loc.name} - ${zo.name}`;
            const destCode = `${loc.id}_${zo.id}`;
            const msg2 = await this.ctx.reply("Choix de votre destination.", `Voulez-vous vraiment partir en direction de: **${destName}** ?`, null, null, "info");
            const choice2 = await this.ctx.reactionCollection(msg2, ["❌", "✅"]);
            if (choice2 === "✅") {
                await this.client.activityDb.travels(this.message.author.id, zo.distance, destCode);
                return await this.ctx.reply("Faites bonne route !", `Vous voilà parti à l'aventure dans la zone de **${destName}** !`, null, null, "success");
            }
            else if (choice2 === "❌") {
                return await this.ctx.reply("Vous restez ici, finalement.", "Vous avez donc décidé de ne pas partir en voyage. Quel dommage !", null, null, "info");
            }
            else if (choice2 === null) {
                return await this.ctx.reply("Choix de votre destination.", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
            }
        }
    }
}

module.exports = new TravelZone();