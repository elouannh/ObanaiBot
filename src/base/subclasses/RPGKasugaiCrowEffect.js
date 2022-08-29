const RPGAssetBase = require("./RPGAssetBase");

class RPGKasugaiCrowEffect extends RPGAssetBase {
    constructor(kasugaiCrow, id, name) {
        super(kasugaiCrow.lang, id);

        this.name = name;
    }
}

module.exports = RPGKasugaiCrowEffect;