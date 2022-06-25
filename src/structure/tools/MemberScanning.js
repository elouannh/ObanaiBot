class MemberScanning {
    constructor(guild, args) {
        this.guild = guild;
        this.args = args;
        this.results = [];
    }

    clearMarkdown(str) {
        const symbols = ["_", "*", "`"];
        for (const symbol of symbols) str.replace(symbol, `\\${symbol}`);
        return str;
    }

    async search() {
        const results = [];
        const members = await this.guild.members.cache;

        if (this.args.length === 0) {
            this.results = "self";
            return this.results;
        }
        for (const member of members.map(e => e)) {
            let str = "";
            let add = false;
            const nick = member.nickname === null ? null : this.clearMarkdown(String(member.nickname));
            const name = this.clearMarkdown(String(member.user.username + " (#" + member.user.discriminator + ")"));

            if (nick !== null) {
                if (nick.startsWith(this.args)) {
                    const splitted = nick.split(this.args);
                    str += `**${this.args}**${splitted.splice(1).join(this.args)} (${name})`;
                    add = true;
                }
            }
            else if (name.startsWith(this.args)) {
                const splitted = name.split(this.args);
                str += `**${this.args}**${splitted.splice(1).join(this.args)}`;
                add = true;
            }

            if (add) results.push({ str, user: member.user });
        }

        if (results.length === 0 && this.args.length >= "539842701592494111".length) {

            for (const member of members.map(e => e)) {
                if (this.args.includes(member.user.id)) {
                    results.push({ str:`**${member.user.username}**`, user: member.user });
                }
            }
        }

        this.results = results;
        return results;
    }

    async selection(cmd) {
        let u = null;
        if (this.results === "self") return cmd.message.author;
        if (this.results.length === 0) await cmd.ctx.reply("Joueur introuvable.", "Aucun résultat n'a été trouvé.", null, null, "warning");
        if (this.results.length > 10) {
            await cmd.ctx.reply(
                "Trop de joueurs.",
                `Le nombre de joueurs trouvés (**${this.results.length}**/10) est trop grand pour la recherche \`${this.args}\`. Veuillez réessayer.`,
                null,
                null,
                "error",
            );
        }
        if (this.results.length === 1) return this.results[0].user;
        if (this.results.length > 1 && this.results.length <= 10) {
            let str = "";
            const r = {};

            for (let i = 0; i < this.results.length; i++) {
                str += `\`${i}\` • ${this.results.at(i).str}\n`;
                r[String(i)] = this.results.at(i);
            }

            const msg = await cmd.ctx.reply(
                "Plusieurs joueurs ont été trouvés.",
                `Veuillez sélectionner le joueur que vous voulez en envoyant le bon numéro.\n\n${str}`,
                null,
                null,
                "info",
            );
            const choice = await cmd.ctx.messageCollection(msg);

            u = (isNaN(Number(choice)) ? null : (Number(choice) >= 0 && Number(choice) < 10 ? r[choice].user : null));
        }
        return u;
    }
}

module.exports = MemberScanning;