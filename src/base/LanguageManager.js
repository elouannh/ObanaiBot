const fs = require("fs");
const Language = require("../languages/Language");

class LanguageManager {
    constructor(client) {
        this.client = client;
        const dir = "./src/languages/json/";
        this.languages = fs.readdirSync(dir).map(languageDir => new Language(languageDir));
    }

    getLang(lang) {
        return this.languages.find(language => language.lang === lang) ?? new Language("fr");
    }
}

module.exports = LanguageManager;