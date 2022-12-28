const RPGAssetBase = require("./RPGAssetBase");

class RPGPlayerRank extends RPGAssetBase {
    constructor(lang, id, rankData) {
        super(lang, id);

        this.name = this.lang.json[this.id];
        this.expRequired = rankData.expRequired;
        this.demonsKilled = rankData.demonsKilled;
        this.storyProgress = rankData.storyProgress;
    }
}

module.exports = RPGPlayerRank;