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
                let atk = await this.cmd.ctx.buttonRequest(
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

                let def = await this.cmd.ctx.buttonRequest(
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
                atk = atk.customId;
                def = def.customId;

                this.damageManager(atk, def, playerAttacking, playerDefending);
                await this.begin();
            }
        }
    }

    damageManager(atk, def, playerAttacking, playerDefending) {
        let dmg = 0;
        let hazardRate = 5;
        let hazardRate2 = 5;
        let dodgeCounterRate = 10;
        let counterRate = 5;

        switch (atk) {
            case "fast":
                dmg = playerAttacking.datas.aptitudes.force * 0.25;
                break;
            case "charged":
                dmg = playerAttacking.datas.aptitudes.force * 0.5;
                hazardRate += 20;
                break;
            case "dodge_preparation":
                dodgeCounterRate += 10;
                break;
            case "special_attack":
                dmg = playerAttacking.datas.aptitudes.force * 0.8;
                hazardRate += 20;
                break;
        }

        let collection = 0;

        switch (def) {
            case "fast":
                collection = playerDefending.datas.aptitudes.defense * 0.25;
                break;
            case "charged":
                collection = playerDefending.datas.aptitudes.defense * 0.5;
                hazardRate2 += 20;
                break;
            case "counter_preparation":
                hazardRate2 += 10;
                counterRate += 10;
                break;
        }

        const finalHazardRate = Math.floor(Math.random() * 100) < (hazardRate / (playerAttacking.datas.aptitudes.agility * 0.1));
        const finalHazardRate2 = Math.floor(Math.random() * 100) < (hazardRate2 / (playerDefending.datas.aptitudes.agility * 0.1));

        if (finalHazardRate || finalHazardRate2) {
            if (finalHazardRate) {
                if (playerAttacking.team.id === "1") this.team1.hurtPlayer(playerAttacking.number, 5);
                if (playerAttacking.team.id === "2") this.team2.hurtPlayer(playerAttacking.number, 5);
            }
            if (finalHazardRate2) {
                if (playerDefending.team.id === "1") this.team1.hurtPlayer(playerDefending.number, 5);
                if (playerDefending.team.id === "2") this.team2.hurtPlayer(playerDefending.number, 5);
            }
        }
        else {
            let finalCounterRate = Math.ceil(dodgeCounterRate - counterRate);
            if (finalCounterRate < 0) finalCounterRate = -1;

            if (Math.floor(Math.random() * 100) < finalCounterRate) {
                if (playerAttacking.team.id === "1") this.team1.hurtPlayer(playerAttacking.number, 5);
                if (playerAttacking.team.id === "2") this.team2.hurtPlayer(playerAttacking.number, 5);
            }
            else {
                const dodged = Math.floor(Math.random() * 100) <= (playerDefending.datas.aptitudes.speed / playerAttacking.datas.aptitudes.speed);

                if (!dodged) {
                    let finalDamages = Math.ceil((dmg - collection) * (Math.floor(Math.random() + 0.5) / 10 + 1));
                    if (finalDamages < 0) finalDamages = 0;

                    if (playerAttacking.team.id === "1") this.team1.hurtPlayer(playerAttacking.number, finalDamages);
                    if (playerAttacking.team.id === "2") this.team2.hurtPlayer(playerAttacking.number, finalDamages);
                }
            }


        }

    }


}

module.exports = Arena;