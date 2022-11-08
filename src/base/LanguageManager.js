const fs = require("fs");
const Language = require("./Language");
const Util = require("./Util");

class LanguageManager {
    constructor(client) {
        this.client = client;
        this.dir = "./src/languages/";
        this.languages = fs.readdirSync(this.dir).filter(f => !f.endsWith(".json")).map(languageDir => new Language(languageDir));

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

            lang.json = Util.ensureLang({ ...french.json }, { ...lang.json }, { value: "false" });

            if (this.client.env.RENDER_TRANSLATIONS === "1" && lang.json._id !== "fr") {
                Json[lang.lang] = Util.ensureLang(
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

    multilang(...path) {
        const languages = fs.readdirSync(this.dir).filter(f => !f.endsWith(".json")).map(languageDir => new Language(languageDir));
        const finalStr = [];

        for (const language of languages) {
            let str = `${language.getFlag} \`${language.lang.toUpperCase()}\` | `;
            let pathStr = language.json;
            for (const p of path) {
                if (pathStr[p] === undefined) {
                    pathStr = null;
                    break;
                }
                pathStr = pathStr[p];
            }
            if (pathStr === null) str += "❌";
            else str += pathStr;
            finalStr.push(str);
        }

        return finalStr.join("\n\n");
    }
}

module.exports = LanguageManager;