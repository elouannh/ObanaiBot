const fs = require("fs");
const { Collection } = require("discord.js");

class Language {
    constructor(lang) {
        this.lang = lang;
        this.jsonDir = fs.readdirSync(`./src/languages/json/${this.lang}/`);
        this.json = new Collection();

        for (const fileName of this.jsonDir) {
            const file = require(`../languages/json/${this.lang}/${fileName}`);
            this.json.set(fileName.replace(".json", ""), file);
        }
    }
}

module.exports = Language;