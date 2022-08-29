const fs = require("fs");
const Language = require("./Language");
const Util = require("./Util");

class LanguageManager {
    constructor(client) {
        this.client = client;
        const dir = "./src/languages/json/";
        this.languages = fs.readdirSync(dir).map(languageDir => new Language(languageDir));

        const french = this.getLang("fr");
        const Json = {};
        for (const lang of this.languages) {
            for (const frenchDir of french.jsonDir) {
                if (!lang.jsonDir.includes(frenchDir)) {
                    const replacedName = frenchDir.replace(".json", "");
                    lang.json[replacedName] = french.json[replacedName];
                    lang.jsonRender[replacedName] = french.jsonRender[replacedName];
                }
            }
            lang.json._id = lang.lang;

            lang.json = new Util(this.client).ensureLang({ ...french.json }, { ...lang.json }, { value: "false" });

            if (this.client.renderTranslations === "true" && lang.json._id !== "fr") {
                Json[lang.lang] = new Util(this.client).ensureLang(
                    { ...french.jsonRender },
                    { ...lang.jsonRender },
                    { value: "true", equalString: "[=]", notInString: "[x]", addedString: "[+]" },
                );
            }
        }
        fs.writeFileSync(
            "./src/languages/rendered.json",
            JSON.stringify(Json, null, 4),
            "utf-8",
        );
    }

    getLang(lang) {
        return this.languages.find(language => language.lang === lang) ?? new Language("fr");
    }
}

module.exports = LanguageManager;