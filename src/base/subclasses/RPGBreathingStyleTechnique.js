const RPGAssetBase = require("./RPGAssetBase");

class RPGBreathingStyleTechnique extends RPGAssetBase {
    constructor(breath, id, name) {
        super(breath.lang, id);

        this.breath = breath;
        this.id = id;
        this.name = name;
    }
}

module.exports = RPGBreathingStyleTechnique;