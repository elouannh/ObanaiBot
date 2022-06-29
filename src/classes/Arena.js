const Team = require("./Team");

class Arena {
    constructor(
        cmd,
        team1,
        team2,
    ) {
        this.cmd = cmd;
        this.teams = {
            "1": new Team(team1, "1", "2"),
            "2": new Team(team2, "2", "1"),
        };
        this.cache = {
            teamPlaying: "1",
            playing: "0",
            lastPlayers: {
                "1": "0",
                "2": "0",
            },
        };

        this.deaths = [];
        this.fightLog = [];
    }

    async init() {
        await this.teams["1"].init(this);
        await this.teams["2"].init(this);
    }

    async stop() {
        return this.cmd.ctx.reply("Oups...", "Le combat a été interrompu.", null, null, "warning");
    }

    rotate() {
        const teamWillPlay = this.teams[this.teams[this.cache.teamPlaying].nid];
        this.cache.teamPlaying = teamWillPlay.id;

        if (Number(this.cache.playing) === Number(Object.keys(teamWillPlay.players).at(-1))) {
            this.cache.playing = "0";
        }
        else {
            this.cache.playing = String(Number(this.cache.playing) + 1);
        }
    }

    async targetChoice(player) {
        const opponentTeam = this.teams[player.team.id];
        const msg = await this.cmd.ctx.reply(
            `${player.name} change sa cible !`,
            `**Pourfendeurs adverses**\n\n${Object.entries(opponentTeam.players).map(e => `**${e[0]}** • ${e[1].name} **${e[1].pv}**/100`).join("\n")}`
            +
            "\n\nRenvoyez le numéro correspondant au pourfendeur que vous souhaitez cibler. Répondez `n` (non) pour garder votre cible.",
            "🎯",
            null,
            "outline",
        );
        const choice = await this.cmd.ctx.messageCollection(msg, 1, 30_000, player.id);

        if (Object.keys(opponentTeam.players).includes(choice)) {
            this.teams[player.team.id].players[player.number].target = choice;
        }
        else {
            await this.cmd.ctx.reply(
                `${player.name} change sa cible !`,
                "Mais il décide finalement de se concentrer sur le même adversaire.",
                "🎯",
                null,
                "outline",
            );
        }

        await this.begin();
    }

    async forfeit(player) {
        const userTeam = this.teams[player.team.id];
        const msg = await this.cmd.ctx.reply(
            `${player.name} veut déclarer forfait.`,
            "Cette décision est irréversible. Souhaitez-vous vraiment abandonner ?"
            +
            "\n\nRépondez avec `y` (oui) ou avec `n` (non).",
            "🍃",
            null,
            "outline",
        );
        const choice = await this.cmd.ctx.messageCollection(msg, 1, 30_000, player.id);

        if (this.cmd.ctx.isResp(choice, "y")) {
            await this.cmd.ctx.reply(`${player.name} veut déclarer forfait.`, "Il quitte l'arène de combat.", "🍃", null, "error");

            const newPlayers = {};
            for (const p of Object.entries(userTeam.players).filter(pl => pl[1].number !== player.number)) newPlayers[p[0]] = p[1];
            this.teams[player.team.id].players = newPlayers;

            Object.entries(this.teams[player.team.nid]).forEach(p => {
                if (p[1].target === player.number) p[1].target = Object.keys(this.teams[player.team.id].players)[0];
            });
        }
        else {
            await this.cmd.ctx.reply(`${player.name} veut déclarer forfait.`, "Mais il décide de ne pas déclarer forfait.", "🍃", null, "outline");

            await this.begin();
        }
    }

    get getLog() {
        console.log(this.fightLog);
        return this.fightLog.length === 0 ? "Aucune information de combat." : this.fightLog[this.fightLog.length - 1];
    }

    async atkPlayer(playerAttacking, playerDefending, defendingTeam) {
        const atk = await this.cmd.ctx.buttonRequest(
            `${playerAttacking.name}, choisisez votre attaque.`,
            `\`\`\`${this.getLog}\`\`\`\n\n`
            +
            `vos pv: ${playerAttacking.pv}/100 | endurance: ${playerAttacking.stamina}/10`
            +
            `\npv de ${playerDefending.name}: ${playerDefending.pv}/100 | endurance: ${playerDefending.stamina}/10`,
            "🥊",
            null,
            "outline",
            require("./buttons/attack")(playerAttacking, Object.keys(defendingTeam.players).length === 1),
            30_000,
            playerAttacking.id,
        );

        return atk === null ? atk : atk.customId;
    }

    async defPlayer(playerDefending, playerAttacking) {
        const def = await this.cmd.ctx.buttonRequest(
            `${playerDefending.name}, choisisez votre défense.`,
            `\`\`\`${this.getLog}\`\`\`\n\n`
            +
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

        return def === null ? def : def.customId;
    }

    async checkDeath() {
        let str = "";
        for (const team of Object.entries(this.teams)) {
            const teamDeath = [];
            const newPlayers = [];
            for (const p of Object.entries(team[1].players)) {
                if (p[1].pv <= 0) {
                    if (teamDeath.length === 0) teamDeath.push(`\n**Équipe ${team[0]}**\n`);
                    teamDeath.push(`Mort de **${p[1].name}** !`);
                }
                else {
                    newPlayers[p[0]] = p[1];
                }
            }
            str += teamDeath.join("\n");
            this.teams[team[0]].players = newPlayers;
        }

        return str;
    }

    async begin() {
        const deaths = await this.checkDeath();
        if (deaths.length > 0) this.deaths.push(deaths);

        const attackingTeam = this.teams[this.cache.teamPlaying];
        const defendingTeam = this.teams[attackingTeam.nid];

        const playerAttacking = attackingTeam.getPlayer(this.cache.playing);
        const playerDefending = defendingTeam.getPlayer(playerAttacking.target);

        let atk = null;
        let def = null;
        if (playerAttacking.entityType === "player") atk = await this.atkPlayer(playerAttacking, playerDefending, defendingTeam);
        if (playerDefending.entityType === "player") def = await this.defPlayer(playerDefending, playerAttacking);

        if (["target_change", "forfeit"].includes(atk)) {
            switch (atk) {
                case "target_change":
                    return await this.targetChoice(playerAttacking);
                case "forfeit":
                    return await this.forfeit(playerAttacking);
            }
        }
        if (def === "forfeit") return await this.forfeit(playerDefending);
        if (atk === null || def === null) return await this.stop();

        this.damageManager(atk, def, playerAttacking, playerDefending);

        this.rotate();
        await this.begin();
    }

    damageManager(atk, def, playerAttacking, playerDefending) {
        let str = "";
        this.staminaManager(atk, def, playerAttacking, playerDefending);

        let dmg = 0;
        let hazardRate = 5;
        let hazardRate2 = 5;
        let dodgeCounterRate = 10;
        let counterRate = 5;

        const attackMvt = playerAttacking.datas.breath.attack[atk];
        const defenseMvt = playerAttacking.datas.breath.defense[atk];

        let sentence = [
            "{aname} utilise <{abreath}>, <{amvt}> ! {dname} répond avec <{dbreath}>, <{dmvt}>",
            "{dname} commence à parer avec <{dbreath}>, >{dmvt}<, tandis que {aname} utilise <{abreath}>, <{amvt}> !",
            "Le choc entre le <{amvt}> du <{abreath}> de {aname} contre le <{dmvt}> du <{dbreath}> de {dname} !",
        ][Math.floor(Math.random() * 3)];

        sentence = sentence.replace("{aname}", playerAttacking.name);
        sentence = sentence.replace("{dname}", playerDefending.name);
        sentence = sentence.replace("{amvt}", attackMvt[Math.floor(Math.random() * attackMvt.length)]);
        sentence = sentence.replace("{dmvt}", defenseMvt[Math.floor(Math.random() * defenseMvt.length)]);
        sentence = sentence.replace("{abreath}", `${playerAttacking.datas.breath.emoji} ${playerAttacking.datas.breath.name}`);
        sentence = sentence.replace("{dbreath}", `${playerDefending.datas.breath.emoji} ${playerDefending.datas.breath.name}`);

        str += sentence;

        switch (atk) {
            case "quick":
                dmg = playerAttacking.datas.aptitudes.force * 0.25;
                break;
            case "powerful":
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
            case "quick":
                collection = playerDefending.datas.aptitudes.defense * 0.25;
                break;
            case "powerful":
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
                this.teams[playerAttacking.team.id].hurtPlayer(playerAttacking.number, 5);
                str += `\n💠 ${playerAttacking.name} se blesse en voulant attaquer... il perd -3❤️ !`;
            }
            if (finalHazardRate2) {
                this.teams[playerDefending.team.id].hurtPlayer(playerDefending.number, 5);
                str += `\n💠 ${playerAttacking.name} se blesse en voulant défendre... il perd -3❤️ !`;
            }
        }
        else {
            let finalCounterRate = Math.ceil(dodgeCounterRate - counterRate);
            if (finalCounterRate < 0) finalCounterRate = -1;

            if (Math.floor(Math.random() * 100) < finalCounterRate) {
                this.teams[playerAttacking.team.id].hurtPlayer(playerAttacking.number, 5);
                str += `\n💠 ${playerAttacking.name} se fait contrer par ${playerDefending.name} en voulant attaquer... il perd -5❤️ !`;
            }
            else {
                const dodged = Math.floor(Math.random() * 100) <= (playerDefending.datas.aptitudes.speed / playerAttacking.datas.aptitudes.speed);

                if (!dodged) {
                    let finalDamages = Math.ceil((dmg - collection) * (Math.floor(Math.random() + 0.5) / 10 + 1) * 10);
                    if (finalDamages < 0) finalDamages = 0;

                    this.teams[playerAttacking.team.id].hurtPlayer(playerAttacking.number, finalDamages);
                    str += `\n💠 ${playerAttacking.name} inflige de lourds dégâts à ${playerDefending.name}... il inflige -${finalDamages}❤️ !`;
                }
                else {
                    str += `\n💠 ${playerAttacking.name} se fait esqsuiver par ${playerDefending.name} en voulant attaquer !`;
                }
            }
        }

        this.fightLog.push(str);
    }

    staminaManager(atk, def, playerAttacking, playerDefending) {
        const cost = {
            "quick": 0,
            "powerful": 2,
            "dodge_preparation": 1,
            "special_attack": 5,
            "counter_preparation": 1,
        };

        this.teams[playerAttacking.team.id].removeStamina(playerAttacking.number, cost[atk]);
        this.teams[playerDefending.team.id].removeStamina(playerDefending.number, cost[def]);
    }

}

module.exports = Arena;