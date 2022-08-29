const RPGAssetBase = require("./RPGAssetBase");

class RPGMapRegionAreaBiome extends RPGAssetBase {
    constructor(parentClass, id, name) {
        super(parentClass.lang, id);

        this.name = name;
    }
}

module.exports = RPGMapRegionAreaBiome;