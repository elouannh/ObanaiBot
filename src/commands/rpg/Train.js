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
            {
                needToBeStatic: false,
                needToBeInRpg: true,
            },
        );
    }

    async run() {
        const exists = await this.hasAdventure();
        if (!exists) return;

        const player = await this.client.playerDb.load(this.user.id);
        const activity = await this.client.activityDb.load(this.user.id);

        console.log(activity.training);

        if (activity.training !== null) {
            return await this.return(this.trad.currentlyTraining
                        .replace("%STATISTIC_NAME", activity.training.statistic.name)
                        .replace("%STATISTIC_LEVEL", activity.training.statistic.level + 1)
                    + this.trad.endsIn
                    + `<t:${this.client.util.round(activity.training.endedDate / 1000)}:R>.`,
            );
        }

        const upgradable = {
            speed: player.statistics.speed,
            strength: player.statistics.strength,
            weaponControl: player.statistics.weaponControl,
            resistance: player.statistics.resistance,
        };
        const choice = await this.menu(
            {
                content: this.trad.choice,
            },
            Object.values(upgradable).map(e =>
                ({ label: e.name, description: this.trad.levelUpTo.replace("%LEVEL", e.level + 1), value: e.id }),
            ),
        );
        if (choice === null) return this.end();

        const selected = upgradable[choice[0]];
        const startedDate = Date.now();
        const endedDate = startedDate + selected.statisticTrainingTimeForNextLevel;
        const wantsToTrain = await this.choice(
            {
                content: this.trad.wantsToTrain
                        .replace("%STATISTIC_NAME", selected.name)
                        .replace("%STATISTIC_LEVEL", selected.level + 1)
                    + this.trad.endsInProbably.replace("%DATE", `<t:${this.client.util.round(endedDate / 1000)}:R>`),
            },
            this.trad.train,
            this.trad.cancel,
        );
        if (wantsToTrain === null) return this.end();

        if (wantsToTrain === "primary") {
            this.client.activityDb.train(
                this.user.id,
                selected.id,
                startedDate,
            );
            return await this.return(
                this.trad.wantsToTrain
                        .replace("%STATISTIC_NAME", selected.name)
                        .replace("%STATISTIC_LEVEL", selected.level + 1)
                    + this.trad.endsInConfirmed.replace("%DATE", `<t:${this.client.util.round(endedDate / 1000)}:R>`),
            );
        }
        else {
            return await this.return(this.trad.trainingCanceled);
        }
    }
}

module.exports = Train;