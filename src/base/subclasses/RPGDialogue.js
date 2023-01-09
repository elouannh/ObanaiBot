const RPGAssetBase = require("./RPGAssetBase");

class RPGDialogue extends RPGAssetBase {
    constructor(lang, id, dialogueData) {
        super(lang, id);

        const data = dialogueData;
    }
}

module.exports = RPGDialogue;