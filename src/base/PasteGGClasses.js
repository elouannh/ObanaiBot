const PasteGG = require("paste.gg");

class PasteGGFile {
    constructor() {
        this.name = "";
        this.content = {
            format: "text",
            highlight_language: "javascript",
            value: "console.log(\"Hello world !\");"
        };
    }

    get file() {
        return {
            name: this.name,
            content: {
                format: this.content.format,
                highlight_language: this.content.highlight_language,
                value: this.content.value,
            }
        }
    }

    setName(name) {
        this.name = name;

        return this;
    }

    setContentFormat(format) {
        this.content.format = format;

        return this;
    }

    setContentHighlightLanguage(highlight_language) {
        this.content.highlight_language = highlight_language;

        return this;
    }

    setContentValue(value) {
        this.content.value = value;

        return this;
    }
}

class PasteGGPost {
    constructor() {
        this.req = {
            "name": "files",
            "description": "some files",
            "visibility": "unlisted",
            "expires": "2024-11-30T23:59:00Z",
            "files": [
                new PasteGGFile().file,
            ]
        };
    }

    get post() {
        return this.req;
    }

    setName(name) {
        this.req.name = name;

        return this;
    }

    setDescription(description) {
        this.req.description = description;

        return this;
    }

    setVisibility(visibility) {
        this.req.visibility = visibility;

        return this;
    }

    setExpires(expires) {
        this.req.expires = expires;

        return this;
    }

    setFiles(files) {
        this.req.files = files;

        return this;
    }
}

class PasteGGManager {
    constructor(client) {
        this.apiKey = "39eab9871704486c80d5075f42f5b005";
        this.pasteGG = new PasteGG(this.apiKey);
    }

    async get(id, includesFileContent) {
        return await this.pasteGG.get(id, includesFileContent);
    }

    async post(post) {
        return await this.pasteGG.post(post);
    }

    async postGuildsList(guilds) {
        const maxLength = guilds.map(e => e.name).sort((a, b) => b - a)[0].length;
        const guildRender = (guild) => {
            return `${guild.id} | ${guild.name}${" ".repeat(maxLength - guild.name.length)} | ${guild.memberCount} members`;
        }
        const file = [
            new PasteGGFile()
                .setName(`guilds_list.json`)
                .setContentValue(
                    guilds.sort((a, b) => b.memberCount - a.memberCount).map(guild => guildRender(guild)).join("\n")
                )
        ];
        const expireDate = () => {
            const event =  new Date();
            event.setMinutes(event.getMinutes() + 15);
            return event.toISOString();
        }
        const post = new PasteGGPost()
            .setName(`Guilds infos`)
            .setFiles(file)
            .setDescription("Liste des serveurs sur lesquels je suis connecté.")
            .setExpires(expireDate())
            .post
        return await this.pasteGG.post(post);
    }
}

module.exports = { PasteGGManager, PasteGGPost, PasteGGFile };