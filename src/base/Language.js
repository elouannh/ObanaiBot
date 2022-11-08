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

    get getFlag() {
        return {
            "null": "❗",
            "fr": "🇫🇷",
            "en": "🇬🇧",
        }[this.lang ?? "null"];
    }

    get langName() {
        return {
            "null": "No name",
            "fr": "Français",
            "en": "English",
        }[this.lang ?? "null"];
    }
}

module.exports = Language;