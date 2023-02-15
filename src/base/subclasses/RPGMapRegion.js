const RPGAssetBase = require("./RPGAssetBase");

class RPGMapRegion extends RPGAssetBase {
    constructor(lang, id) {
        super(lang, id);

        this.name = this.lang.json.regions[this.id].name;
    }
}

module.exports = RPGMapRegion;