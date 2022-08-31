const RPGAssetBase = require("./RPGAssetBase");

class RPGGrimoireEffect extends RPGAssetBase {
    constructor(grimoire, grimoireEffect, name) {
        super(grimoire.lang, grimoireEffect.id);

        this.name = name;
        this.strength = grimoireEffect.strength;
    }
}

module.exports = RPGGrimoireEffect;