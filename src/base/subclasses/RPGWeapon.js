const RPGAssetBase = require("./RPGAssetBase");

class RPGWeapon extends RPGAssetBase {
    constructor(lang, weaponId, rarityId) {
        super(lang, weaponId);

        this.name = this.lang.json.weapons[weaponId];
        this.rarityName = this.lang.json.rarities[rarityId];
        this.rarity = Number(rarityId);
    }
}

module.exports = RPGWeapon;