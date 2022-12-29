const RPGAssetBase = require("./RPGAssetBase");

class RPGBlacksmith extends RPGAssetBase {
    constructor(lang, id, rankData) {
        super(lang, id);

        this.rank = this.lang.json.ranks[this.id];
        this.requiredForgedWeapon = rankData.requiredForgedWeapon;
        this.resources = rankData.resources;
        this.timePerRarity = rankData.timePerRarity;
    }
}

module.exports = RPGBlacksmith;