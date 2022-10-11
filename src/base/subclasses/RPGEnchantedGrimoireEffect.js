const RPGAssetBase = require("./RPGAssetBase");

class RPGEnchantedGrimoireEffect extends RPGAssetBase {
    constructor(grimoire, grimoireEffect, name) {
        super(grimoire.lang, grimoireEffect.id);

        this.name = name;
        this.strength = grimoireEffect.strength;
    }
}

module.exports = RPGEnchantedGrimoireEffect;