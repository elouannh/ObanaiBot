const RPGAssetBase = require("./RPGAssetBase");

class RPGKasugaiCrowEffect extends RPGAssetBase {
    constructor(kasugaiCrow, kasugaiCrowEffectDatas, name) {
        super(kasugaiCrow.lang, kasugaiCrowEffectDatas.id);

        this.maxStrength = kasugaiCrowEffectDatas.maxStrength;
        this.name = name;
    }
}

module.exports = RPGKasugaiCrowEffect;