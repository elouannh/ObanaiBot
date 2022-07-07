/* eslint-disable quotes */
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
        this.turn = {
            number: 1,
            phase: "Phase d'Attaque",
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
        return this.cmd.ctx.reply("Oups...", "Le combat a été interrompu.", null, null, "warning", false);
    }

    rotate() {
        const actualTeam = this.teams[this.cache.teamPlaying];
        const opponentTeam = this.teams[actualTeam.nid];

        for (const team of [actualTeam, opponentTeam]) {
            const lengthMax = Object.values(team.players).filter(p => p.id !== this.cache.lastPlayers[team.id]).length;

            if (lengthMax > 0) {
                this.cache.lastPlayers[team.id] = Object.keys(team.players)[Math.floor(Math.random() * Object.keys(team.players).length)];
            }
        }

        this.cache.teamPlaying = opponentTeam.id;
        this.cache.playing = this.cache.lastPlayers[opponentTeam.id];
    }

    async targetChoice(player) {
        const opponentTeam = this.teams[player.team.nid];
        const msg = await this.cmd.ctx.reply(
            `${player.name} change sa cible !`,
            `**Adversaires**\n\n${Object.entries(opponentTeam.players).map(e => `**${e[0]}** • ${e[1].name} **${e[1].pv}**/100`).join("\n")}`
            +
            "\n\nRenvoyez le numéro correspondant à l'ennemi que vous souhaitez cibler. Répondez `n` (non) pour garder votre cible.",
            "🎯",
            null,
            "outline",
            false,
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
                false,
            );
        }

        await this.begin();
    }

    removePlayer(player) {
        const userTeam = this.teams[player.team.id];
        const newPlayers = {};
        for (const p of Object.entries(userTeam.players).filter(pl => pl[1].number !== player.number)) newPlayers[p[0]] = p[1];
        this.teams[player.team.id].players = newPlayers;

        Object.entries(this.teams[userTeam.nid].players).forEach(p => {
            if (this.teams[p[1].team.id].players[p[0]].target === player.number) {
                this.teams[p[1].team.id].players[p[0]].target = Object.keys(this.teams[userTeam.id].players).at(0);
            }
        });
    }

    async forfeit(player) {
        const msg = await this.cmd.ctx.reply(
            `${player.name} veut déclarer forfait.`,
            "Cette décision est irréversible. Souhaitez-vous vraiment abandonner ?"
            +
            "\n\nRépondez avec `y` (oui) ou avec `n` (non).",
            "🍃",
            null,
            "outline",
            false,
        );
        const choice = await this.cmd.ctx.messageCollection(msg, 1, 30_000, player.id);

        if (this.cmd.ctx.isResp(choice, "y")) {
            await this.cmd.ctx.reply(`${player.name} veut déclarer forfait.`, "Il quitte l'arène de combat.", "🍃", null, "error", false);

            this.removePlayer(player);
            this.rotate();

            await this.begin();
        }
        else {
            await this.cmd.ctx.reply(`${player.name} veut déclarer forfait.`, "Mais il décide de ne pas déclarer forfait.", "🍃", null, "outline", false);

            await this.begin();
        }
    }

    get getLog() {
        return this.fightLog.length === 0 ? "Aucune information de combat." : this.fightLog[this.fightLog.length - 1];
    }

    async atkPlayer(playerAttacking, playerDefending, defendingTeam) {
        const atk = await this.cmd.ctx.buttonRequest(
            playerAttacking.user,
            `${playerAttacking.name}, choisisez votre attaque.`,
            `\`\`\`diff\n+ Tour ${this.turn.number} - ${this.turn.phase}\`\`\`\n\`\`\`xl\n${this.getLog}\`\`\`\n\n`
            +
            `————— **Stats** —————————————\n**${playerAttacking.name}**: ❤️**\`${playerAttacking.pv}\`**\`/100\` • ⚡**\`${playerAttacking.stamina}\`**\`/10\``
            +
            `\n\n(🎯) **${playerDefending.name}**: ❤️**\`${playerDefending.pv}\`**\`/100\` • ⚡**\`${playerDefending.stamina}\`**\`/10\``
            +
            "\n\n————— **Choix** —————————————\n"
            +
            require("./buttons/choiceinfos.json").attack.join("\n"),
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
            playerDefending.user,
            `${playerDefending.name}, choisisez votre défense.`,
            `\`\`\`diff\n- Tour ${this.turn.number} - ${this.turn.phase}\`\`\`\`\`\`xl\n${this.getLog}\`\`\`\n\n`
            +
            `————— **Stats** —————————————\n**${playerDefending.name}**: ❤️**\`${playerDefending.pv}\`**\`/100\` • ⚡**\`${playerDefending.stamina}\`**\`/10\``
            +
            `\n\n(🗡️) **${playerAttacking.name}**: ❤️**\`${playerAttacking.pv}\`**\`/100\` • ⚡**\`${playerAttacking.stamina}\`**\`/10\``
            +
            "\n\n————— **Choix** —————————————\n"
            +
            require("./buttons/choiceinfos.json").defense.join("\n"),
            "🛡️",
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
            for (const p of Object.entries(team[1].players)) {
                if (p[1].pv <= 0) {
                    if (teamDeath.length === 0) teamDeath.push(`\n**Équipe ${team[0]}**\n`);
                    teamDeath.push(`Mort de **${p[1].name}** !`);
                    this.removePlayer(p[1]);
                }
            }
            str += teamDeath.join("\n");
        }

        return str;
    }

    async winDisplay(hasWinner) {
        await this.cmd.ctx.reply(
            "Arène terminée !",
            `L'équipe **${hasWinner.id}** sort vainqueur ! Les combattants qui ont survécu sont :`
            +
            Object.entries(hasWinner.players).map(e => `\`${e[1].name}\``).join(" / "),
            "🏆",
            null,
            "warning",
            false,
        );
    }

    async begin() {
        const deaths = await this.checkDeath();
        if (deaths.length > 0) {
            this.deaths.push(deaths);
            await this.cmd.ctx.reply("Malheur !", this.deaths[this.deaths.length - 1], "☠️", null, "error");
        }

        let hasWinner = false;
        for (const t of Object.entries(this.teams)) if (Object.keys(t[1].players).length === 0) hasWinner = t[1].nid;
        if (typeof hasWinner === "string") {
            hasWinner = this.teams[hasWinner];
            await this.winDisplay(hasWinner);
            return;
        }

        const attackingTeam = this.teams[this.cache.teamPlaying];
        const defendingTeam = this.teams[attackingTeam.nid];

        const playerAttacking = attackingTeam.getPlayer(this.cache.playing);
        const playerDefending = defendingTeam.getPlayer(playerAttacking.target);

        let atk = null;
        this.turn.phase = "Phase d'Attaque";
        if (playerAttacking.entityType === "player") atk = await this.atkPlayer(playerAttacking, playerDefending, defendingTeam);

        if (["target_change", "forfeit"].includes(atk)) {
            switch (atk) {
                case "target_change":
                    return await this.targetChoice(playerAttacking);
                case "forfeit":
                    return await this.forfeit(playerAttacking);
            }
            return;
        }

        let def = null;
        this.turn.phase = "Phase de Défense";
        if (playerDefending.entityType === "player") def = await this.defPlayer(playerDefending, playerAttacking);

        this.turn.number++;

        if (def === "forfeit") return await this.forfeit(playerDefending);
        if (atk === null || def === null) return await this.stop();

        this.rotate();
        this.damageManager(atk, def, playerAttacking, playerDefending);

        await this.begin();
    }

    damageManager(atk, def, playerAttacking, playerDefending) {
        let str = "";
        this.staminaManager(atk, def, playerAttacking, playerDefending);

        let dmg = 0;
        let hazardRate = 5;
        let hazardRate2 = 5;
        let dodgeCounterRate = 10;
        let counterRate = playerDefending.counterRate + 5;

        const attackMvt = playerAttacking.datas.breath.attack[atk];
        const defenseMvt = playerDefending.datas.breath.defense[def];

        let sentence = [
            '{aname} utilise "{abreath}, {amvt}" ! {dname} répond avec "{dbreath}, {dmvt}"',
            '{dname} commence à parer avec "{dbreath}", "{dmvt}", tandis que {aname} utilise "{abreath}", "{amvt}" !',
            'Le choc entre le "{amvt}" du "{abreath}" de {aname} contre le "{dmvt}" du "{dbreath}" de {dname} !',
        ][Math.floor(Math.random() * 3)];

        sentence = sentence.replace("{aname}", playerAttacking.name);
        sentence = sentence.replace("{dname}", playerDefending.name);
        sentence = sentence.replace("{amvt}", attackMvt[Math.floor(Math.random() * attackMvt.length)]);
        sentence = sentence.replace("{dmvt}", defenseMvt[Math.floor(Math.random() * defenseMvt.length)]);
        sentence = sentence.replace("{abreath}", `${playerAttacking.datas.breath.emoji} ${playerAttacking.datas.breath.name}`);
        sentence = sentence.replace("{dbreath}", `${playerDefending.datas.breath.emoji} ${playerDefending.datas.breath.name}`);

        str += sentence;
        const force = Math.ceil(playerAttacking.datas.aptitudes.force / 30) * 10;
        const defense = Math.ceil(playerDefending.datas.aptitudes.defense / 30) * 10;

        switch (atk) {
            case "quick":
                dmg = force * 0.55;
                this.teams[playerAttacking.team.id].addStamina(playerAttacking.number, 1);
                break;
            case "powerful":
                dmg = force * 0.65;
                hazardRate += 10;
                break;
            case "dodge_preparation":
                dmg = force * 0.5;
                dodgeCounterRate += 30;
                break;
            case "special_attack":
                dmg = force * 0.9;
                hazardRate += 20;
                break;
        }

        let collection = 0;

        switch (def) {
            case "quick":
                collection = defense * 0.5;
                this.teams[playerDefending.team.id].addStamina(playerDefending.number, 1);
                break;
            case "powerful":
                collection = defense * 0.75;
                hazardRate2 += 10;
                break;
            case "counter_preparation":
                hazardRate2 += 10;
                counterRate += 20;
                collection = defense * 0.4;
                break;
        }

        const finalHazardRate = Math.floor(Math.random() * 100) < (hazardRate / (playerAttacking.datas.aptitudes.agility * 0.05));
        const finalHazardRate2 = Math.floor(Math.random() * 100) < (hazardRate2 / (playerDefending.datas.aptitudes.agility * 0.05));

        if (finalHazardRate || finalHazardRate2) {
            if (finalHazardRate) {
                this.teams[playerAttacking.team.id].hurtPlayer(playerAttacking.number, 3);
                str += `\n\n» ${playerAttacking.name} se blesse en voulant attaquer... il perd -3❤️ !`;
            }
            if (finalHazardRate2) {
                this.teams[playerDefending.team.id].hurtPlayer(playerDefending.number, 3);
                str += `\n\n» ${playerDefending.name} se blesse en voulant défendre... il perd -3❤️ !`;
            }
        }
        else {
            let finalCounterRate = Math.ceil(counterRate - dodgeCounterRate);
            if (finalCounterRate < 0) finalCounterRate = 0;

            if (Math.floor(Math.random() * 100) < finalCounterRate) {
                const force2 = Math.ceil(playerDefending.datas.stats.force / 3) * 10;
                const defense2 = Math.ceil(playerAttacking.datas.stats.defense / 3) * 10;

                dmg = force2 * 0.4 - defense2 * 0.15;

                let finalDamages2 = Math.ceil(dmg * (Math.floor(Math.random() + 0.5) / 10 + 1) * 1.5);
                if (finalDamages2 < 0) finalDamages2 = 0;
                this.teams[playerAttacking.team.id].hurtPlayer(playerAttacking.number, finalDamages2);
                str += `\n\n» ${playerAttacking.name} se fait contrer par ${playerDefending.name} en voulant attaquer... il perd -${finalDamages2}❤️ !`;
                this.teams[playerDefending.team.id].players[playerDefending.number].counterRate = 5;
            }
            else {
                this.teams[playerDefending.team.id].players[playerDefending.number].counterRate = counterRate;
                const dodged = Math.floor(Math.random() * 100) <= (playerDefending.datas.aptitudes.speed / playerAttacking.datas.aptitudes.speed);
                let finalDamages = Math.ceil((dmg - collection) * (Math.floor(Math.random() + 0.5) / 10 + 1) * 1.5);

                if (!dodged) {
                    if (finalDamages < 0) finalDamages = 0;

                    this.teams[playerDefending.team.id].hurtPlayer(playerDefending.number, finalDamages);
                    str += `\n\n» ${playerAttacking.name} inflige de lourds dégâts à ${playerDefending.name}... il inflige -${finalDamages}❤️ !`;
                }
                else {
                    str += `\n\n» ${playerAttacking.name} se fait esqsuiver par ${playerDefending.name} en voulant attaquer !`;
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