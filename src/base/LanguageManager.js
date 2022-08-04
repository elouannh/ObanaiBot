const fs = require("fs");
const Language = require("../languages/Language");

class LanguageManager {
    constructor(client) {
        this.client = client;
        const dir = "./src/languages/json/";
        this.languages = fs.readdirSync(dir).map(file => new Language(file.replace(".json", "")));
    }

    getLang(identifier) {
        return this.languages.find(lang => lang.identifier === identifier) ?? new Language("fr");
    }
}

module.exports = LanguageManager;