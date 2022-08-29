const RPGAssetBase = require("./RPGAssetBase");
const RPGBreathTechnique = require("./RPGBreathTechnique");

class RPGBreath extends RPGAssetBase {
    constructor(lang, id) {
        super(lang, id);

        const datas = this.lang.json[this.id];
        this.name = datas.name;
        this.techniques = Object.entries(datas.techniques).map(e => new RPGBreathTechnique(this, e[0], e[1]));
    }
}

module.exports = RPGBreath;