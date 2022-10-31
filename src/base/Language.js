const fs = require("fs");

class Language {
    constructor(lang) {
        this.lang = lang;
        this.jsonDir = fs.readdirSync(`./src/languages/${this.lang}`);
        this.json = {};
        this.jsonRender = {};

        for (const fileName of this.jsonDir) {
            for (const attr of ["json", "jsonRender"]) {
                this[attr][fileName.replace(".json", "")] = require(`../languages/${this.lang}/${fileName}`);
            }
        }
    }
}

module.exports = Language;