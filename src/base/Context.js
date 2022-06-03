const SuperEmbed = require("./SuperEmbed");
const translate = require("translate");

class Context {
    constructor(client, command) {
        this.client = client;
        this.command = command;
    }

    async trStr(str) {
        const l = await this.client.playerDb.getLang(this.command.message.author.id);

        const a = str.split("\n");
        const c = [];
        for (const b of a) {
            if (b.startsWith("t")) {
                c.push(b.slice(1));
            }
            else if (b.replace("\n", "").length > 1) {
                const e = await translate(b, { from: "fr", to: l });
                c.push(e);
            }
            else {
                c.push("");
            }
        }

        return c.join("\n");
    }

    async reply(title, description, emoji, color, style) {

        await this.command.message.channel.sendTyping();
        const tit = await this.trStr(title);
        const desc = await this.trStr(description);

        const reponse = new SuperEmbed()
            .setAuthor(this.command.message.author)
            .setTitle(tit)
            .setDescription(desc);

        if (style !== null) {
            reponse.setStyle(style);
        }
        if (emoji !== null || color !== null) {
            if (emoji !== null) reponse.setEmoji(emoji);
            if (color !== null) reponse.setColor(color.replace("#", ""));
        }
        return await this.command.message.channel.send({ embeds: [reponse.embed] });
    }

    async reactionCollection(message = null, reacts, time = null, userr = undefined) {
        if (message === null) message = this.command.message;
        if (time === null) time = 30_000;

        for (const react of reacts) await message.react(react);

        const filter = (reaction, user) => reacts.includes(reaction.emoji.name) && user.id === (userr ?? this.command.message.author.id);
        const max = 1;
        const choice = await message.awaitReactions({ filter, time, max }).catch(() => { return null; });

        if (choice) {
            if (choice.first()) return choice.first()._emoji.name;
            else return null;
        }
    }

}

module.exports = Context;