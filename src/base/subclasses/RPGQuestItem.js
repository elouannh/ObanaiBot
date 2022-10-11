const RPGAssetBase = require("./RPGAssetBase");

class RPGQuestItem extends RPGAssetBase {
    constructor(lang, id) {
        super(lang, id);

        this.name = this.lang.json[this.id];
    }
}

module.exports = RPGQuestItem;