const RPGAssetBase = require("./RPGAssetBase");

class RPGQuestObjective extends RPGAssetBase {
    constructor(lang, id) {
        super(lang, id);

        this.name = this.lang.objectives[this.id];
    }
}

module.exports = RPGQuestObjective;