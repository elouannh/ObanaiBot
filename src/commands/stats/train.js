const Command = require("../../base/Command");
const convertDate = require("../../utils/convertDate");
const calcPlayerLevel = require("../../elements/calcPlayerLevel");

class Train extends Command {
    constructor() {
        super({
            aliases: ["train"],
            args: [],
            category: "Stats",
            cooldown: 10,
            description: "Commande permettant de vous entrainer et d'améliorer le niveaux de vos aptitudes.",
            examples: ["[p]train"],
            finishRequest: "ADVENTURE",
            name: "train",
            private: "none",
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
                return await this.ctx.reply(
                    "S'entraîner.",
                    "Il semblerait que vous êtes déjà en train de vous entraîner ! Voici plus d'informations :"
                    +
                    `\n\`\`\`Aptitude: ${emojis[aDatas.training.aptitude]}${values[aDatas.training.aptitude]}\nTemps restant: ${convertDate(timeLeft).string}\`\`\``,
                    "🤜",
                    null,
                    "outline",
                );
            }
            else {
                const pDatas = await this.client.playerDb.get(this.message.author.id);
                const apt = pDatas.stats[aDatas.training.aptitude];
                await this.client.activityDb.endOfTrain(this.message.author.id);
                await this.client.playerDb.earnExp(this.message.author.id, Math.floor(Math.random() * 150) + 100, this);
                return await this.ctx.reply(
                    "S'entraîner.",
                    `Votre aptitude \`${aDatas.training.aptitude}\` monte ! Passage de niveau **${apt}** > **${apt + 1}**`,
                    "🤜",
                    null,
                    "outline",
                );
            }
        }
        const pDatas = await this.client.playerDb.get(this.message.author.id);
        const userLevel = calcPlayerLevel(pDatas.exp).level;

        let str = "";
        for (const key in emojis) {
            str += `\n\n${emojis[key]} | \`id:${key}\` **${values[key]}**`;
            if (userLevel < pDatas.stats[key]) {
                str += " | Niveau max atteint. Pour continuer à progresser, gagnez en XP.";
            }
            else {
                times[key] = await this.client.activityDb.trainingTime(this.message.author.id, ((15 + (pDatas.stats[key] * 15))));
                str += ` | Niveau **${pDatas.stats[key]}** > Niveau **${pDatas.stats[key] + 1}**`;
                str += `\n*🕣 Durée d'entraînement: ${convertDate(times[key], true).string}*`;
            }
        }

        if (Object.keys(times).length === 0) {
            return await this.ctx.reply(
                "S'entraîner.",
                "Il semblerait que vous n'ayez pas assez d'expérience pour continuer de vous entraîner. Continuez de progresser !",
                "🤜",
                null,
                "outline",
            );
        }
        else {
            str += "\n\nRépondre avec l'id de l'aptitude. En répondant avec le nom de l'aptitude, l'entraînement se lancera directement. Répondre avec `n` (non) pour annuler.";
        }

        const msg = await this.ctx.reply("S'entraîner.", str, "🤜", null, "outline");
        const choice = await this.ctx.messageCollection(msg);

        if (Object.keys(times).includes(choice)) {
            const finalChoice = Object.keys(emojis).filter(e => e === choice)?.at(0);
            await this.client.activityDb.trains(this.message.author.id, finalChoice, times[finalChoice]);
            return await this.ctx.reply("S'entraîner.", `Vous voilà parti à l'entraînement ! Revenez dans **${convertDate(times[choice], true).string}**.`, "🤜", null, "outline");
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply("S'entraîner.", "Vous décidez de ne pas vous entraîner.", "🤜", null, "outline");
        }
        else {
            return await this.ctx.reply("S'entraîner.", "La commande n'a pas aboutie.", null, null, "timeout");
        }
    }
}

module.exports = Train;