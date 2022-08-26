const PasteGG = require("paste.gg");
const PasteGGFile = require("./subclasses/PasteGGFile");
const PasteGGPost = require("./subclasses/PasteGGPost");

class PasteGGManager {
    constructor() {
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
        const maxLength = guilds.map(e => e.name).sort((a, b) => b.length - a.length)?.at(0)?.length;
        const guildRender = (guild) => {
            return `${guild.id} | ${guild.name}${" ".repeat(maxLength - guild.name.length)}`
                + ` | ${guild.memberCount} members`;
        };
        const file = [
            new PasteGGFile()
                .setName("guilds_list.json")
                .setContentValue(
                    guilds.sort((a, b) => b.memberCount - a.memberCount).map(guild => guildRender(guild)).join("\n"),
                ),
        ];
        const expireDate = () => {
            const event = new Date();
            event.setMinutes(event.getMinutes() + 15);
            return event.toISOString();
        };
        const post = new PasteGGPost()
            .setName("Guilds infos")
            .setFiles(file)
            .setDescription("Liste des serveurs sur lesquels je suis connecté.")
            .setExpires(expireDate())
            .post;
        return await this.pasteGG.post(post);
    }
}

module.exports = { PasteGGManager, PasteGGPost, PasteGGFile };