const RPGAssetBase = require("./RPGAssetBase");
const RPGKasugaiCrowEffect = require("./RPGKasugaiCrowEffect");

class RPGKasugaiCrow extends RPGAssetBase {
    constructor(lang, id, kasugaiCrowDatas) {
        super(lang, id);

        const datas = kasugaiCrowDatas;
        this.name = this.lang.json.names[this.id];
        this.effects = datas.effects.map(e => new RPGKasugaiCrowEffect(this, e.id, this.lang.json.effects[e.id]));
    }
}

module.exports = RPGKasugaiCrow;