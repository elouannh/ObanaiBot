const RPGAssetBase = require("./RPGAssetBase");

class RPGDialogue extends RPGAssetBase {
    // eslint-disable-next-line no-unused-vars
    constructor(lang, id, dialogueData) {
        super(lang, id);

        this.name = dialogueData.name;
        this.read = dialogueData.read;
        this.content = [];
    }
}

module.exports = RPGDialogue;