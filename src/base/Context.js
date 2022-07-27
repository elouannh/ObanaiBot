const SuperEmbed = require("./SuperEmbed");
const translate = require("translate");
const SuperRow = require("./SuperRow");
const SuperButton = require("./SuperButton");
const SuperSelectMenu = require("./SuperSelectMenu");
const delay = require("../utils/delay");

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

    async send(content = "", emoji = "", reply = true) {
        if (reply) {
            await this.command.message.channel.send({ content: `> <@${this.command.message.author.id}>, ${emoji === "" ? "" : `${emoji} `}${content}`, failIfNoExists: false });
        }
        else {
            await this.command.message.channel.send({ content: `> ${emoji === "" ? "" : `${emoji} `}${content}` });
        }
    }

    async betterReply(title, description, emoji, color, style, displayName = true, image) {

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
        if (image !== null) reponse.setImage(image);

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
                    new SuperButton().setCustomId(but.customId).setDisabled(but.disabled).setEmoji(but.emoji).setLabel(but.label).setStyle(but.style).setUrl(but.url).button,
                );
            }
            compos.push(cache.row);
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

    // ROW MODEL -------------------------------------
    /*

    [
        {
            "type": "button"||"menu",
            "components": [
                {
                    "style": 1,
                    "label": "<instance>",
                    "emoji": "",
                    "customId": "default",
                    "url": "",
                    "disabled": false,
                },
                {
                    "customId": "default",
                    "options": [
                        "label": "default label",
                        "value": "default_label",
                        "description": "null",
                        "default": true,
                    ],
                    "placeholder": "placeholder",
                    "minValues": 0,
                    "maxValues": 1,
                    "disabled": false,
                }
            ]
        }
    ]

    */

    async superRequest(embeds, rows, author = null, msgToEdit = null, sendIfFail = false) {
        // MESSAGE PART --------------------------------------------------------------------------------------------------------------------------
        if (msgToEdit === null) await this.command.message.channel.sendTyping();
        const em = [];

        for (const embed of embeds) {
            const tit = await this.trStr(embed.title);
            const desc = await this.trStr(embed.description);
            if (author === null) author = this.command.message.author;

            const reponse = new SuperEmbed()
                .setAuthor(author)
                .setTitle(tit)
                .setDescription(desc);

            if (embed.style !== null) {
                reponse.setStyle(embed.style);
            }
            if (embed.emoji !== null || embed.color !== null) {
                if (embed.emoji !== null) reponse.setEmoji(embed.emoji);
                if (embed.color !== null) reponse.setColor(embed.color.replace("#", ""));
            }

            em.push(reponse.embed);
        }

        // ROW PART ------------------------------------------------------------------------------------------------------------------------------
        const compos = [];
        for (const row of rows) {
            const cache = new SuperRow(1);
            for (const sr of row.components) {
                if (row.type === "button") {
                    cache.addComponent(
                        new SuperButton()
                        .setCustomId(sr.customId)
                        .setDisabled(sr.disabled)
                        .setEmoji(sr.emoji)
                        .setLabel(sr.label)
                        .setStyle(sr.style)
                        .setUrl(sr.url)
                        .button,
                    );
                }
                else if (row.type === "menu") {
                    cache.addComponent(
                        new SuperSelectMenu()
                        .setCustomId(sr.customId)
                        .setPlaceholder(sr.placeholder)
                        .setDisabled(sr.disabled)
                        .setMaxValues(sr.maxValues)
                        .setMinValues(sr.minValues)
                        .setOptions(sr.options)
                        .menu,
                    );
                }
            }
            compos.push(cache.row);
        }

        if (msgToEdit === null) {
            return await this.command.message.channel.send({ embeds: em, components: compos });
        }
        else {
            const edited = await msgToEdit.edit({ embeds: em, components: compos })
                .catch(async () => {
                    if (sendIfFail) {
                        return await this.command.message.channel.send({ embeds: em, components: compos });
                    }
                    else {
                        return null;
                    }
                });

            return edited;
        }
    }

    async superResp(msg, time = null, userr = undefined, noDefer = []) {
        if (time === null) time = 30_000;

        const filter = interaction => interaction.user.id === (userr ?? this.command.message.author.id);
        const way = await msg.awaitMessageComponent({ filter, time })
            .catch(() => { return null; });

        try {
            if (!noDefer.includes(way.customId)) way.deferUpdate();
        }
        catch (err) {
            null;
        }

        return way;
    }

    async end(msg) {
        await msg.edit({ embeds: msg.embeds, content: msg.content, attachments: msg.attachments, components: [] })
        .catch(async () => {
            return null;
        });
    }

    async modalSubmission(interaction, customId, defer = true, time = 30_000) {
        const modalSubmission = await interaction.awaitModalSubmit({
            filter: (inter) => inter.customId === customId,
            time,
        }).catch(() => { return null; });

        if (defer) {
            try { modalSubmission.deferUpdate(); }
            catch (err) { null; }
        }

        return modalSubmission;
    }

    async multipleMessageCollection(message = null, time = null, users = null) {
        if (message === null) message = this.command.message;
        if (time === null) time = 60_000;

        const filter = msg => (this.isResp(msg.content, "y") || this.isResp(msg.content, "n")) && users.includes(msg.author.id);
        const max = users.length;
        const choice = await message.channel.awaitMessages({ filter, time, max }).catch(() => { return null; });

        if (choice) {
            if (choice) return choice;
            else return null;
        }
    }

    async fightAwaitResponse(message = null, time = null, users = null) {
        if (message === null) message = this.command.message;
        if (time === null) time = 60_000;

        const reacted = [];
        const nopes = [];
        const filter = msg => (this.isResp(msg.content, "y") || this.isResp(msg.content, "n")) && users.includes(msg.author.id) && !reacted.includes(msg.author.id);
        const collector = message.channel.createMessageCollector({ filter, time });
        collector.on("collect", r => {
            reacted.push(r.author.id);
            if (this.isResp(r.content, "n")) nopes.push(r.author.id);
        });
        collector.on("end", () => { return reacted; });

        await delay(time);
        return { reacted, nopes };
    }

}

module.exports = Context;