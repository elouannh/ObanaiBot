const SuperEmbed = require("./SuperEmbed");
const translate = require("translate");
const SuperRow = require("./SuperRow");
const SuperButton = require("./SuperButton");

class Context {
    constructor(client, command) {
        this.client = client;
        this.command = command;
    }

    isResp(str, compareStr) {
        const choices1 = ["y", "yes", "oui", "accept", "confirm"];
        const choices2 = ["n", "no", "non", "refuse", "cancel"];

        return [choices1, choices2][["y", "n"].indexOf(compareStr)].includes(str?.toLowerCase() ?? "chèvre");
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

    async reply(title, description, emoji, color, style, displayName = true) {

        await this.command.message.channel.sendTyping();
        const tit = await this.trStr(title);
        const desc = await this.trStr(description);

        const reponse = new SuperEmbed()
            .setTitle(tit)
            .setDescription(desc);

        if (displayName) reponse.setAuthor(this.command.message.author);

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

    async messageCollection(message = null, max = 1, time = null, userr = undefined) {
        if (message === null) message = this.command.message;
        if (time === null) time = 30_000;

        const filter = msg => msg.author.id === (userr ?? this.command.message.author.id);
        const choice = await message.channel.awaitMessages({ filter, time, max }).catch(() => { return null; });

        if (choice) {
            if (choice.first()) return choice.first().content;
            else return null;
        }
    }

    async buttonRequest(author, title, description, emoji, color, style, rows, time = null, userr = undefined) {
        // MESSAGE PART --------------------------------------------------------------------------------------------------------------------------
        await this.command.message.channel.sendTyping();
        const tit = await this.trStr(title);
        const desc = await this.trStr(description);

        const reponse = new SuperEmbed()
            .setAuthor(author)
            .setTitle(tit)
            .setDescription(desc);

        if (style !== null) {
            reponse.setStyle(style);
        }
        if (emoji !== null || color !== null) {
            if (emoji !== null) reponse.setEmoji(emoji);
            if (color !== null) reponse.setColor(color.replace("#", ""));
        }

        // ROW PART ------------------------------------------------------------------------------------------------------------------------------
        const compos = [];
        for (const row of rows) {
            const cache = new SuperRow(1);
            for (const but of row) {
                cache.addComponent(
                    new SuperButton().setCustomId(but.customId).setDisabled(but.disabled).setEmoji(but.emoji).setLabel(but.label).setStyle(but.style).setUrl(but.url).datas,
                );
            }
            compos.push(cache.datas);
        }

        const msg = await this.command.message.channel.send({ content: `<@${author.id}>`, embeds: [reponse.embed], components: compos });

        if (time === null) time = 30_000;

        const filter = interaction => interaction.user.id === (userr ?? this.command.message.author.id);
        const way = await msg.awaitMessageComponent({ filter, time })
            .catch(() => { return null; });

        try {
            if (way.message.deletable) {
                way.message.delete();
            }
        }
        catch (err) { null; }

        return way;
    }

}

module.exports = Context;