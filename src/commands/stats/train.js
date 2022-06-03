const Command = require("../../base/Command");
const fs = require("fs");
const convertDate = require("../../utils/convertDate");
const calcPlayerLevel = require("../../elements/calcPlayerLevel");

class Train extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["train"],
            args: [],
            category: "Stats",
            cooldown: 10,
            description: "Commande permettant de vous entrainer et d'améliorer le niveaux de vos aptitudes.",
            examples: ["train"],
            finishRequest: "ADVENTURE",
            name: "train",
            ownerOnly: false,
            permissions: 0,
            syntax: "train",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");

        const aDatas = await this.client.activityDb.get(this.message.author.id);
        const values = { "agility": "Agilité", "defense": "Défense", "force": "Force", "speed": "Vitesse" };
        const emojis = { "agility": "🤸‍♂️", "defense": "🛡️", "force": "👊", "speed": "⚡" };
        const times = {};

        if (aDatas.isTraining) {
            const timeLeft = aDatas.training.start + aDatas.training.duration - Date.now();
            if (timeLeft > 0) {
                return await this.ctx.reply("Vous vous entraînez déjà.", `Il semblerait que vous êtes déjà en train de vous entraîner ! Voici plus d'informations :\n\`\`\`Aptitude: ${emojis[aDatas.training.aptitude]}${values[aDatas.training.aptitude]}\nTemps restant: ${convertDate(timeLeft).string}\`\`\``, null, null, "outline");
            }
            else {
                const pDatas = await this.client.playerDb.get(this.message.author.id);
                const apt = pDatas.stats[aDatas.training.aptitude];
                await this.client.activityDb.endOfTrain(this.message.author.id);
                await this.client.playerDb.gainExp(this.message.author.id, Math.floor(Math.random() * 150) + 100, this);
                return await this.ctx.reply("Votre entraînement est terminé !", `Votre aptitude \`${aDatas.training.aptitude}\` monte ! Passage de niveau **${apt}** > **${apt + 1}**`, null, null, "success");
            }
        }
        const pDatas = await this.client.playerDb.get(this.message.author.id);
        const userLevel = calcPlayerLevel(pDatas.exp).level;

        const goodMojs = [];
        let str = "";
        for (const key in emojis) {
            if (userLevel < pDatas.stats[key]) {
                str += `\n\n> ${emojis[key]} **${values[key]}** | Niveau max atteint. Gagnez en expérience !`;
            }
            else {
                times[key] = await this.client.activityDb.trainingTime(this.message.author.id, ((15 + (pDatas.stats[key] * 15))));
                str += `\n\n> ${emojis[key]} **${values[key]}** | **${pDatas.stats[key]}** > **${pDatas.stats[key] + 1}**`;
                str += `\n🕣 entraînement: ${convertDate(times[key], true).string}`;
                goodMojs.push(emojis[key]);
            }
        }
        if (goodMojs.length === 0) return await this.ctx.reply("Impossible de vous entraîner.", "Il semblerait que vous n'ayez pas assez d'expérience pour continuer de vous entraîner. Continuez de progresser !", null, null, "info");

        goodMojs.push("❌");
        const msg = await this.ctx.reply("Lancer un entrainement.", str, null, null, "info");
        const choice = await this.ctx.reactionCollection(msg, goodMojs);

        if (choice === null) {
            return await this.ctx.reply("Choix de votre entraînement.", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
        }
        if (choice === "❌") {
            return await this.ctx.reply("Choix de votre entraînement.", "Vous décidez de ne pas vous entraîner.", null, null, "info");
        }
        else {
            const finalChoice = Object.keys(emojis).filter(e => emojis[e] === choice)?.at(0);
            const msg2 = await this.ctx.reply("Partir en entraînement !", `Souhaitez vous vraiment vous entraîner ? Vous ne pourrez pas revenir en arrière !\nVotre aptitude **${values[finalChoice]}** montera au niveau **${pDatas.stats[finalChoice] + 1}**`, null, null, "info");
            const choice2 = await this.ctx.reactionCollection(msg2, ["❌", "✅"]);
            if (choice2 === "✅") {
                await this.client.activityDb.trains(this.message.author.id, finalChoice, times[finalChoice]);
                return await this.ctx.reply("Bon courage !", "Vous voilà parti à l'entrainement !", null, null, "success");
            }
            else if (choice2 === "❌") {
                return await this.ctx.reply("Vous restez ici, finalement.", "Vous avez donc décidé de ne pas partir vous entrainer. Quel dommage !", null, null, "info");
            }
            else if (choice2 === null) {
                return await this.ctx.reply("Choix de votre entrainement.", "Vous avez mis trop de temps à répondre, la commande a été annulée.", null, null, "timeout");
            }
        }
    }
}

module.exports = new Train();