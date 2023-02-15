const RPGAssetBase = require("./RPGAssetBase");

class RPGMapDistrictSectorBiome extends RPGAssetBase {
    constructor(parentClass, id, name) {
        super(parentClass.lang, id);

        this.name = name;
    }
}

module.exports = RPGMapDistrictSectorBiome;