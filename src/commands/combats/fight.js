const Command = require("../../base/Command");
const Arena = require("../../classes/Arena");
const Player = require("../../classes/Player");
const MemberScanning = require("../../structure/tools/MemberScanning");
const { Collection } = require("discord.js");

async function requestReady(client, user, infos) {
    let ready = true;

    if (!client.requests.has(user)) client.requests.set(user, new Collection());

    // Collection<string, string> avec string[0] = cmd.name et string[1] = lien
    const userRequests = client.requests.get(user);
    // Array<string> avec string.prototype = cmd.name
    const neededRequests = infos.finishRequest;
    const notFinished = [];

    // ........string of Array<string>
    for (const needed of neededRequests) {
        if (userRequests.filter(req => req.req === needed).map(e => e).length > 0) {
            for (const mulReq of userRequests.filter(req => req.req === needed).map(e => e)) {
                notFinished.push(mulReq);
            }
        }
    }

    if (notFinished.length > 0) ready = false;

    return ready;
}

class Fight extends Command {
    constructor() {
        super({
            adminOnly: false,
            aliases: ["fight", "f"],
            args: [["player", "joueurs que vous souhaitez affronter.", false]],
            category: "Stats",
            cooldown: 5,
            description: "Commande permettant de se battre contre un pourfendeur.",
            examples: ["fight @pandawou"],
            finishRequest: "ADVENTURE",
            name: "fight",
            ownerOnly: false,
            permissions: 0,
            syntax: "fight <?player>",
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

                if (user !== null && !teams["1"].concat(teams["2"]).map(player => player.id).includes(user.id)) teams[String(i)].push(user);
            }

            i++;
        }

        if (teams["2"].length === 0) {
            teams["2"] = teams["1"].filter(p => p.id !== this.message.author.id);
            teams["1"] = [this.message.author];
        }
        teams["1"] = teams["1"].splice(0, 4);
        teams["2"] = teams["2"].splice(0, 4);

        const teamsStr = `${Object.entries(teams).map(t => `Équipe **${t[0]}**: ${t[1].map(p => `\`${p.username}\``).join(" / ")}`).join("\n")}`;
        if (teams["1"].length === 1 && teams["2"].length === 0) {
            return await this.ctx.reply(
                "Arène - Équipes",
                teamsStr
                +
                "\n\nVous ne pouvez pas jouer tout seul !",
                "🏟️",
                null,
                "outline",
            );
        }

        let allReady = true;
        for (const p of teams["1"].concat(teams["2"]).filter(e => e.id !== this.message.author.id)) {
            const ready = await requestReady(this.client, p.id, this.infos);
            if (!ready) allReady = false;
        }

        if (!allReady) return await this.ctx.reply("Oups...", "Des joueurs sont déjà en combat.", null, null, "warning");

        for (const p of teams["1"].concat(teams["2"]).filter(e => e.id !== this.message.author.id)) {
            this.client.lastChannel.set(p.id, this.message.channel.channel);
            this.client.requests.get(p.id).set(this.message.id,
                { req: this.infos.name, src: `https://discord.com/channels/${this.message.guild.id}/${this.message.channel.id}/${this.message.id}` },
            );
        }

        const msg = await this.ctx.reply(
            "Arène - Équipes",
            teamsStr
            +
            "\n\n**Tous les participants** doivent valider leur participation en écrivant `y` (oui). Si vous ne voulez pas jouer, faites `n` (non).",
            "🏟️",
            null,
            "outline",
        );
        const response = await this.ctx.multipleMessageCollection(msg, null, teams["1"].concat(teams["2"]).map(e => e.id));

        const mapArray = response.map(e => Object.assign({ author: "", resp: "" }, { author: e.author, resp: e.content }));
        if (mapArray.map(e => e.author).length !== new Set(mapArray.map(e => e.author)).size) {
            return await this.ctx.reply(
                "Arène - Équipes",
                "Des joueurs ont répondu plusieurs fois.",
                "🏟️",
                null,
                "outline",
            );
        }

        if (mapArray.filter(e => this.ctx.isResp(e.resp, "y")).length !== mapArray.length) {
            return await this.ctx.reply(
                "Arène - Équipes",
                `Les joueurs suivant ont refusé le combat: ${mapArray.filter(e => this.ctx.isResp(e.resp, "n")).map(e => `\`${e.author.username}\``).join(" / ")}`,
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
            this.client.requests.get(p.id).delete(this.message.id);
        }
    }
}

module.exports = new Fight();