const RPGAssetBase = require("./RPGAssetBase");

class RPGCharacter extends RPGAssetBase {
    constructor(lang, id, characterData) {
        super(lang, id);

        const data = characterData;
        this.fullName = data.fullName;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.japaneseTranscription = data.japaneseTranscription;

        this.gender = this.lang.json.genders[data.gender];
        this.label = this.lang.json[this.id].label;
        this.description = this.lang.json[this.id].description;
    }
}

module.exports = RPGCharacter;