const fs = require("fs");
const Language = require("./Language");
const Util = require("./Util");

class LanguageManager {
    constructor(client) {
        this.client = client;
        const dir = "./src/languages/json/";
        this.languages = fs.readdirSync(dir).map(languageDir => new Language(languageDir));

        const french = this.getLang("fr");
        const Json = {
            " ----": "__________________________",
            "_TUTORIEL": "Use this JSON to find bad translated files. Just search for \"[TRANSLATION NOT FOUND]\", and navigate !",
            "TUTORIEL_": "You can also search [UNEXPECTED TRANSLATION] to find the translations that are not necessary.",
            "---- ": "__________________________",
        };
        for (const lang of this.languages) {
            for (const frenchDir of french.jsonDir) {
                if (!lang.jsonDir.includes(frenchDir)) {
                    const replacedName = frenchDir.replace(".json", "");
                    lang.json[replacedName] = french.json[replacedName];
                }
            }

            lang.json = new Util(this.client).ensureLang(french.json, lang.json);
            lang.json._id = lang.lang;
            Json[lang.lang] = lang.json;
        }
        fs.writeFileSync("./src/languages/rendered.json", JSON.stringify(Json, null, 4), "utf-8");
    }

    getLang(lang) {
        return this.languages.find(language => language.lang === lang) ?? new Language("fr");
    }
}

module.exports = LanguageManager;