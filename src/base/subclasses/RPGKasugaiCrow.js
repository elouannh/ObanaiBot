const RPGAssetBase = require("./RPGAssetBase");
const RPGKasugaiCrowEffect = require("./RPGKasugaiCrowEffect");

class RPGKasugaiCrow extends RPGAssetBase {
    constructor(lang, id, kasugaiCrowdata) {
        super(lang, id);

        const data = kasugaiCrowData;
        this.name = this.lang.json.names[this.id];
        this.effects = data.effects.map(e => new RPGKasugaiCrowEffect(this, e, this.lang.json.effects[e.id]));
    }
}

module.exports = RPGKasugaiCrow;