const Team = require("./Team");

class Arena {
    constructor(
        cmd,
        team1,
        team2,
    ) {
        this.cmd = cmd;
        this.team1 = new Team(team1, "1");
        this.team2 = new Team(team2, "2");
        this.cache = {
            teamToPlay: "1",
            playerToPlay: "0",
            played: false,
        };
    }

    async init() {
        await this.team1.init(this);
        await this.team2.init(this);
    }

    async stop() {
        return this.cmd.ctx.reply("Oups...", "Le combat a été interrompu.", null, null, "warning");
    }

    async begin() {
        if (this.cache.teamToPlay === "1") {
            if (!this.cache.played) {
                const playerAttacking = this.team1.getPlayer(this.cache.playerToPlay);
                // choix attaque
                const playerDefending = this.team2.getPlayer(playerAttacking.target);
                // choix défense
                const atk = await this.cmd.ctx.buttonRequest(
                    `${playerAttacking.name}, choisisez votre attaque.`,
                    `vos pv: ${playerAttacking.pv}/100 | endurance: ${playerAttacking.stamina}/10`
                    +
                    `\npv de ${playerDefending.name}: ${playerDefending.pv}/100 | endurance: ${playerDefending.stamina}/10`,
                    "🥊",
                    null,
                    "outline",
                    require("./buttons/attack")(playerAttacking),
                    30_000,
                    playerAttacking.id,
                );

                const def = await this.cmd.ctx.buttonRequest(
                    `${playerAttacking.name}, choisisez votre attaque.`,
                    `vos pv: ${playerDefending.pv}/100 | endurance: ${playerDefending.stamina}/10`
                    +
                    `\npv de ${playerAttacking.name}: ${playerAttacking.pv}/100 | endurance: ${playerAttacking.stamina}/10`,
                    "🥊",
                    null,
                    "outline",
                    require("./buttons/defense")(playerDefending),
                    30_000,
                    playerDefending.id,
                );

                if (atk === null || def === null) return await this.stop();
            }
        }
    }

    damageManager(atk, def, playerAttacking, playerDefending) {
        
    }


}

module.exports = Arena;