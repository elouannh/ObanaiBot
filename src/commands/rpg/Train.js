const Command = require("../../base/Command");

class Train extends Command {
    constructor() {
        super(
            {
                name: "train",
                description: "Permet à l'utilisateur d'entraîner ses différentes aptitudes.",
                descriptionLocalizations: {
                    "en-US": "Allows the user to train their different skills.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Train",
                dmPermission: true,
            },
            {
                trad: "train",
                type: [1],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["adventureLocal"],
                authorizationBitField: 0b000,
                permissions: 0n,
                targets: ["read", "write"],
            },
        );
    }

    async run() {
        const user = this.interaction.user;
        if (!(await this.client.playerDb.exists(user.id))) {
            if (this.client.playerDb.get(user.id).alreadyPlayed) {
                await this.interaction.reply({
                    content: this.lang.systems.playerNotFoundAlreadyPlayed,
                    ephemeral: true,
                }).catch(this.client.catchError);
                return this.end();
            }
            await this.interaction.reply({ content: this.lang.systems.playerNotFound, ephemeral: true })
                .catch(this.client.catchError);
            return this.end();
        }

        const player = await this.client.playerDb.load(user.id);
        const activity = await this.client.activityDb.load(user.id);

        if (activity.training !== null) {
            await this.interaction.reply({
                content: `Vous êtes déjà en train d'améliorer votre **${activity.training.statistic.name}** `
                    + `au niveau **${activity.training.statistic.level + 1}**. `
                    + `Votre entraînement se termine dans <t:${this.client.util.round(activity.training.endedDate / 1000)}:R>.`,
            }).catch(this.client.catchError);
            return this.end();
        }

        const upgradable = {
            speed: player.statistics.speed,
            strength: player.statistics.strength,
            weaponControl: player.statistics.weaponControl,
            resistance: player.statistics.resistance,
        };
        const choice = await this.menu(
            {
                content: "Choisissez une statistique à améliorer:",
            },
            Object.values(upgradable).map(e =>
                ({ label: e.name, description: `Passage au niveau ${e.level + 1}`, value: e.id }),
            ),
        );
        if (choice === null) return this.end();

        const selected = upgradable[choice[0]];
        const startedDate = Date.now();
        const endedDate = startedDate + selected.statisticTrainingTimeForNextLevel;
        const wantsToTrain = await this.choice(
            {
                content: `Voulez-vous vraiment entraîner votre **${selected.name}** `
                    + `au niveau **${selected.level + 1}** ?`
                    + `\nVotre entraînement se terminerait <t:${this.client.util.round(endedDate / 1000)}:R>.`,
            },
            "Entraîner",
            "Annuler",
        );
        if (wantsToTrain === null) return this.end();

        if (wantsToTrain === "primary") {
            this.client.activityDb.train(
                user.id,
                selected.id,
                startedDate,
            );
            await this.interaction.editReply({
                content: `Vous avez commencé à entraîner votre **${selected.name}** au niveau **${selected.level + 1}**.`
                    + ` L'entraînement se terminera dans <t:${this.client.util.round(endedDate / 1000)}:R>.`,
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
        else {
            await this.interaction.editReply({
                content: "L'entraînement a été annulé.",
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
    }
}

module.exports = Train;