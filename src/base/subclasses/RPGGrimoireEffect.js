const RPGAssetBase = require("./RPGAssetBase");

class RPGGrimoireEffect extends RPGAssetBase {
    constructor(grimoire, id, name) {
        super(grimoire.lang, id);

        this.name = name;
    }
}

module.exports = RPGGrimoireEffect;