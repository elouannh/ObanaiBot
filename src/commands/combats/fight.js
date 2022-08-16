const Command = require("../../base/Command");
const Arena = require("../../classes/Arena");
const Player = require("../../classes/Player");
const MemberScanning = require("../../structure/tools/MemberScanning");

class Fight extends Command {
    constructor() {
        super({
            category: "Combats",
            cooldown: 15,
            description: "Commande permettant de se battre contre des joueurs, avec des alliés ou non.",
            finishRequest: "ADVENTURE",
            name: "fight",
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        const teams = {
            "1": [this.message.author],
            "2": [],
        };
        const [team1, team2] = this.args.join(" ").split("&&");

        let i = 1;
        for (const team of [team1, team2].filter(t => t !== undefined)) {
            const teamMembers = team.split(/ +/).filter(elt => elt !== "");

            for (const member of teamMembers) {
                const scan = new MemberScanning(this.message.guild, member);
                await scan.search();
                const user = await scan.selection(this);

                if (user !== null && !teams["1"].concat(teams["2"]).map(player => player.id).includes(user.id)) {
                    const pExists = await this.client.playerDb.started(user.id);
                    if (pExists) teams[String(i)].push(user);
                }
            }

            i++;
        }

        if (teams["2"].length === 0) {
            teams["2"] = teams["1"].filter(p => p.id !== this.message.author.id);
            teams["1"] = [this.message.author];
        }
        teams["1"] = teams["1"].splice(0, 4);
        teams["2"] = teams["2"].splice(0, 4);

        const teamsStr = `${Object.entries(teams)
            .map(t => `Équipe **${t[0]}**: ${t[1].map(p => `\`${p.username}\``).join(" / ")}`).join("\n")
        }`;

        if (teams["1"].length === 1 && teams["2"].length === 0) {
            return await this.ctx.send(
                "🏟️ Arènes:\n"
                +
                teamsStr
                +
                "\n\nVous ne pouvez pas jouer tout seul !",
            );
        }

        let allReady = true;
        for (const p of teams["1"].concat(teams["2"]).filter(e => e.id !== this.message.author.id)) {
            const ready = await this.requestReady(p.id);
            if (!ready) allReady = false;
        }

        if (!allReady) {
            return await this.ctx.reply("Oups...", "Des joueurs sont déjà en combat.", null, null, "warning");
        }

        for (const p of teams["1"].concat(teams["2"]).filter(e => e.id !== this.message.author.id)) {
            this.client.lastChannel.set(p.id, this.message.channel.channel);
            this.client.requestsManager.add(p.id, { key: this.infos.name, value: Date.now() });
        }

        const msg = await this.ctx.reply(
            "Arène - Équipes",
            teamsStr
            +
            "\n\n**Tous les participants** doivent valider leur participation en écrivant `y` (oui)."
            +
            " Si vous ne voulez pas jouer, faites `n` (non).",
            "🏟️",
            null,
            "outline",
        );

        const allUsers = teams["1"].concat(teams["2"]);
        const response = await this.ctx.fightAwaitResponse(msg, 5_000, allUsers.map(e => e.id));

        if (response.reacted.length < allUsers.map(e => e.id).length) {
            for (const p of allUsers.filter(e => e.id !== this.message.author.id)) {
                this.client.requestsManager.remove(p.id, this.infos.name);
            }
            return await this.ctx.reply(
                "Arène - Équipes",
                `Les joueurs suivant n'ont pas répondu: ${
                    allUsers.filter(e => !response.reacted.includes(e.id))
                        .map(e => `\`${this.client.users.fetch(e.id)?.username ?? "Pourfendeur X"}\``)
                        .join(" / ")
                }`,
                "🏟️",
                null,
                "outline",
            );
        }

        if (response.nopes.length > 0) {
            for (const p of allUsers.filter(e => e.id !== this.message.author.id)) {
                this.client.requestsManager.remove(p.id, this.infos.name);
            }
            return await this.ctx.reply(
                "Arène - Équipes",
                `Les joueurs suivant ont refusé le combat: ${response.nopes
                    .map(e => `\`${this.client.users.fetch(e.id)?.username ?? "Pourfendeur X"}\``)
                    .join(" / ")
                }`,
                "🏟️",
                null,
                "outline",
            );
        }

        const arena = new Arena(
            this,
            teams["1"].map(e => new Player(e.id, e.username, e)),
            teams["2"].map(e => new Player(e.id, e.username, e)),
        );

        await arena.init();
        await arena.begin();

        for (const p of teams["1"].concat(teams["2"]).filter(e => e.id !== this.message.author.id)) {
            this.client.requestsManager.remove(p.id, this.message.infos.name);
        }
    }
}

module.exports = Fight;