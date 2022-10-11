const RPGAssetBase = require("./RPGAssetBase");

class RPGKasugaiCrowEffect extends RPGAssetBase {
    constructor(kasugaiCrow, kasugaiCrowEffectData, name) {
        super(kasugaiCrow.lang, kasugaiCrowEffectData.id);

        this.maxStrength = kasugaiCrowEffectData.maxStrength;
        this.name = name;
    }
}

module.exports = RPGKasugaiCrowEffect;