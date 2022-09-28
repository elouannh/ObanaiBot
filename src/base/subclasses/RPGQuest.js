const RPGAssetBase = require("./RPGAssetBase");

class RPGQuest extends RPGAssetBase {
    constructor(lang, id, questData) {
        super(lang, id);

        const data = questData;
        this.id = data.id;
        this.tome = data.tome ?? null;
        this.arc = data.arc ?? null;
        this.objectives = data.objectives;
    }
}

module.exports = RPGQuest;