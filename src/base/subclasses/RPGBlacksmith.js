const RPGAssetBase = require("./RPGAssetBase");

class RPGBlacksmith extends RPGAssetBase {
    constructor(lang, id, rankData) {
        super(lang, id);

        this.rank = this.lang.json.ranks[this.id];
        this.requiredForgedWeapon = rankData.requiredForgedWeapon;
        this.res = rankData.resources;
        this.timePerRarity = rankData.timePerRarity;
    }

    getTimeInMinutes(rarity) {
        return this.timePerRarity * (rarity + 1);
    }

    getDate(rarity) {
        return Date.now() + this.getTimeInMinutes(rarity) * 60000;
    }
}

module.exports = RPGBlacksmith;