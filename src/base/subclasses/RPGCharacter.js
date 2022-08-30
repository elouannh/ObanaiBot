const RPGAssetBase = require("./RPGAssetBase");

class RPGCharacter extends RPGAssetBase {
    constructor(lang, id, characterDatas) {
        super(lang, id);

        const datas = characterDatas;
        this.fullName = datas.fullName;
        this.firstName = datas.firstName;
        this.lastName = datas.lastName;
        this.japaneseTranscription = datas.japaneseTranscription;

        this.label = this.lang.json[this.id].label;
        this.description = this.lang.json[this.id].description;
    }
}

module.exports = RPGCharacter;