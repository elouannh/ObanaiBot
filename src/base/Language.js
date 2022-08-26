const fs = require("fs");

class Language {
    constructor(lang) {
        this.lang = lang;
        this.jsonDir = fs.readdirSync(`./src/languages/json/${this.lang}/`);
        this.json = {};

        for (const fileName of this.jsonDir) {
            this.json[fileName.replace(".json", "")] = require(`../languages/json/${this.lang}/${fileName}`);
        }
    }
}

module.exports = Language;