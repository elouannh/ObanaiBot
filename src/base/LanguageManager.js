const fs = require("fs");
const Language = require("../languages/Language");
const Util = require("./Util")

class LanguageManager {
    constructor(client) {
        this.client = client;
        const dir = "./src/languages/json/";
        this.languages = fs.readdirSync(dir).map(languageDir => new Language(languageDir));

        const frenchLanguage = this.getLang("fr");
        this.languages.map(language => language.json.set(
            "commands",
            Util(null).ensureObj(frenchLanguage.json.get("commands"), language.json.get("commands")),
        ));
    }

    getLang(lang) {
        return this.languages.find(language => language.lang === lang) ?? new Language("fr");
    }
}

module.exports = LanguageManager;