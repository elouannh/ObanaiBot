const RPGAssetBase = require("./RPGAssetBase");

class RPGInteraction extends RPGAssetBase {
    // eslint-disable-next-line no-unused-vars
    constructor(lang, id, interactionData) {
        super(lang, id);

        this.play = interactionData.play;
    }
}

module.exports = RPGInteraction;