const Command = require("../../base/Command");
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

class SquadInvite extends Command {
    constructor() {
        super({
            aliases: ["squad-invite", "sqin"],
            args: [["player", "joueur que vous voulez inviter.", true]],
            category: "Escouades",
            cooldown: 15,
            description: "Commande permettant d'inviter des membres dans son escouade.",
            examples: ["[p]squad-invite @pandawou"],
            finishRequest: "ADVENTURE",
            name: "squad-invite",
            private: "none",
            permissions: 0n,
            syntax: "squad-invite <player>",
        });
    }

    async run() {
        const pExists = await this.client.playerDb.started(this.message.author.id);
        if (!pExists) {
            return await this.ctx.reply("Vous n'êtes pas autorisé.", "Ce profil est introuvable.", null, null, "error");
        }

        const scan = new MemberScanning(this.message.guild, this.args.join(""));
        await scan.search();
        const user = await scan.selection(this);

        if (user === null) return;
        if (user.id === this.message.author.id) {
            return await this.ctx.reply("Oups...", "Vous ne pouvez pas vous inviter vous-même.", null, null, "warning");
        }

        const ready = await requestReady(this.client, user.id, this.infos);
        if (!ready) {
            return await this.ctx.reply(
                "Oups...",
                "Le joueur ciblé est déjà occupé avec une autre commande.",
                null,
                null,
                "warning",
            );
        }

        this.client.lastChannel.set(user.id, this.message.channel.channel);
        this.client.requests.get(user.id).set(this.message.id,
            {
                req: this.infos.name,
                src: "https://discord.com/channels/"
                     +
                     `${this.message.guild.id}/${this.message.channel.id}/${this.message.id}`,
            },
        );

        const msg = await this.ctx.reply(
            "Inviter un nouveau membre.",
            `**${user.username}**, voulez-vous rejoindre l'escouade de **${this.message.author.username}** ?`
            +
            "\n\nRépondre avec `y` (oui) ou `n` (non).",
            "⛩️",
            null,
            "outline",
        );
        const choice = await this.ctx.messageCollection(msg, 1, 30_000, user.id);
        this.client.requests.get(user.id).delete(this.message.id);

        if (this.ctx.isResp(choice, "y")) {
            const pDatas = await this.client.playerDb.get(this.message.author.id);

            if (pDatas.squad === null) {
                return await this.ctx.reply("Oups...", "Vous ne possédez pas d'escouade.", null, null, "warning");
            }
            if (pDatas.squad.owner !== this.message.author.id) {
                return await this.ctx.reply(
                    "Oups...",
                    "Seul les chefs d'escouade peuvent inviter des joueurs à vous rejoindre.",
                    null,
                    null,
                    "warning",
                );
            }
            const uExists = await this.client.playerDb.started(user.id);
            if (!uExists) {
                return await this.ctx.reply(
                    "Oups...",
                    "Le profil du joueur souhaitant rejoindre est introuvable.",
                    null,
                    null,
                    "warning",
                );
            }
            if (await this.client.squadDb.isFull(pDatas.squad.owner)) {
                return await this.ctx.reply(
                    "Oups...",
                    "Cette escouade contient déjà le nombre maximum de joueurs. (8)",
                    null,
                    null,
                    "warning",
                );
            }
            if (await this.client.playerDb.hasSquad(user.id)) {
                return await this.ctx.reply(
                    "Oups...",
                    "Ce joueur possède déjà une escouade, il est donc impossible de l'inviter dans la votre.",
                    null,
                    null,
                    "warning",
                );
            }

            await this.client.squadDb.joinSquad(pDatas.squad.owner, user.id);
            return await this.ctx.reply(
                "Inviter un nouveau membre.",
                "Le joueur a accepté de rejoindre l'escouade. Bienvenue à lui !",
                "⛩️",
                null,
                "outline",
            );
        }
        else if (this.ctx.isResp(choice, "n")) {
            return await this.ctx.reply(
                "Inviter un nouveau membre.",
                "Le joueur a refusé de rejoindre l'escouade.",
                "⛩️",
                null,
                "outline",
            );
        }
        else {
            return await this.ctx.reply(
                "Inviter un nouveau membre.",
                "La commande n'a pas aboutie.",
                null,
                null,
                "timeout",
            );
        }
    }
}

module.exports = SquadInvite;